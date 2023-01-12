import { createRequire } from "module";
import { finished } from "stream";
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/race', { useNewUrlParser: true });

const raceSchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true,
    },
    date: String,
    location: String,
    results: [
        {
            runner: String,
            cat: String,
            number: Number,
            position: Number,
            result: String
        }
    ]
});
const Race = mongoose.model('race', raceSchema);

// Define the general classification schema
const generalClassificationSchema = new mongoose.Schema({
  runner: String,
  races: Number,
  points: Number
});

// Create the general classification model
const GeneralClassificationModel = mongoose.model('GeneralClassification', generalClassificationSchema);

async function generateFirstRaceResultsForGeneralClassification() {
    let generalClassification = []
  
    // Retrieve the results from the first race
    const firstRaceResults = await Race.find({name: "Kx5.xlsx"})
    // Iterate through the results and create a new object for each runner,
    // with their name, number of races, and points set to zero

    firstRaceResults.forEach(result => {
        for (var i = 0; i < result.results.length; i++) {
            // console.log(result.results[i]);
            let runner = {
                runner: result.results[i].runner,
                races: 1,
                points: result.results[i].position,
              }
          
              // Add the runner to the general classification array
              generalClassification.push(runner);
        }
    });
    // Sort the general classification by points in ascending order
    // console.log(generalClassification);
    // generalClassification.sort((a, b) => a.points - b.points);
    // Finally, insert the general classification after the first race into the MongoDB collection
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
}

async function generateSecondRaceResultsForGeneralClassification() {
    // At this point, all runners from the first and the second race are in the general classification
    // Repeat the above steps for the second race
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    const secondRaceResults = await Race.find({name: "Lx5.xlsx"});

    // Create a list of runners that only took part in the first race
    secondRaceResults.forEach(result => {
        let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        let newRunnerNames = new Set(result.results.map(x => x.runner));
        let firstRaceOnlyRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
        // Add to general classification runners that only took part in the first race. 
        oldGeneralClassification.forEach(runner => {
            if (firstRaceOnlyRunners.includes(runner.runner)) {
                let plainRunner = runner.toObject();
                delete plainRunner._id;
                generalClassification.push(plainRunner);
            }
        })
        for (var i = 0; i < result.results.length; i++) {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.results[i].runner);
            if (existingRunner) {
                existingRunner.races += 1;
                existingRunner.points += result.results[i].position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                generalClassification.push(plainRunner);
            } 
            else {
                let runner = {
                    runner: result.results[i].runner,
                    races: 1,
                    points: result.results[i].position,
                }
                generalClassification.push(runner);
            }
        }
    });
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await GeneralClassificationModel.deleteMany({});
    // Create updated general classification
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
}

async function generateThirdRaceResultsForGeneralClassification() {
    // At this point, first and second race results need to be updated, which will lead to the general classification being updated, 
    // before the third race results are added to the general classification
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    // console.log(oldGeneralClassification);
    const thirdRaceResults = await Race.find({name: "Rx5.xlsx"});

    // Create a list of runners that only took part in the first race
    thirdRaceResults.forEach(result => {
        let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        let newRunnerNames = new Set(result.results.map(x => x.runner));
        let firstAndSecondRaceOnlyRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
        // Add to general classification runners that took part in the first only, second race only, or both, but didn't take part
        // in the third race
        oldGeneralClassification.forEach(runner => {
            if (firstAndSecondRaceOnlyRunners.includes(runner.runner)) {
                let plainRunner = runner.toObject();
                delete plainRunner._id;
                generalClassification.push(plainRunner);
            }
        })
        // Add runners that took part in the third race and in one or both of the previous races
        for (var i = 0; i < result.results.length; i++) {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.results[i].runner);
            if (existingRunner) {
                existingRunner.races += 1;
                existingRunner.points += result.results[i].position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                generalClassification.push(plainRunner);
            } 
            // Add runners that took part only in the third race. 
            else {
                let runner = {
                    runner: result.results[i].runner,
                    races: 1,
                    points: result.results[i].position,
                }
                generalClassification.push(runner);
            }
        }
    });
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await GeneralClassificationModel.deleteMany({});
    // Create updated general classification
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);

    // At this point, the general classification contains runners that shouldn't be counted towards it because
    // they took part in fewer than 2 races
    // The general classification needs to be checked to identify runners that participated in fewer than 2 races
    // These runners will then have to be removed from the first race results and second race results 
    // and the general classification needs to be recalculated
}

async function recalculateGeneralClassificationResults() {
    
    let currentGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');

    let currentRunnerNames = new Set(currentGeneralClassification.map(x => x.runner));

    let runnersToRemove = [...currentRunnerNames].filter(x => x.races < 2);
    console.log(runnersToRemove)
    // Retrieve first race results again
    // const firstRaceResults = await Race.find({name: "Kx5.xlsx"});
    // console.log(firstRaceResults)
    // firstRaceResults.forEach(result => {
    //     for (var i = 0; i < result.results.length; i++) {

    //     }
    // })
}

// async function generateGeneralClassification() {

// //     const thirdRaceResults = await Race.find({name: "Rx5.xlsx"})
// //     thirdRaceResults.forEach(result => {
// //         for (var i = 0; i < result.results.length; i++) {
// //             let existingRunner = generalClassification.find(runner => runner.runner === result.results[i].runner)
// //             if (existingRunner) {
// //                 existingRunner.races += 1
// //                 existingRunner.points += result.position
// //             } else {
// //                 let runner = {
// //                     runner: result.results[i].runner,
// //                     races: 1,
// //                     points: result.results[i].position,
// //                 }
// //                 generalClassification.push(runner)
// //             }
// //         }
// //     });

// //     // const fourthRaceResults = await Race.find({name: "Px5.xlsx"})
// //     // fourthRaceResults.forEach(result => {
// //     //   let existingRunner = generalClassification.find(runner => runner.runner === result.runner)
// //     //   if (existingRunner) {
// //     //     existingRunner.races += 1
// //     //     existingRunner.points += result.position
// //     //   } else {
// //     //     let runner = {
// //     //       runner: result.runner,
// //     //       races: 1,
// //     //       points: result.position,
// //     //       position: null
// //     //     }
// //     //     generalClassification.push(runner)
// //     //   }
// //     // });

// //     // // iterate through the general classification array and  check each runner's participation variable 
// //     // // if the variable is less than number of races - 1 , remove that runner name from all previous race results.
// //     // generalClassification = generalClassification.filter(runner => runner.races >= 4);
// //     // // Sort the general classification array by points and update the position field for each runner.
// //     // generalClassification.sort((a, b) => a.points - b.points)
// //     // for (let i = 0; i < generalClassification.length; i++) {
// //     //   generalClassification[i].position = i + 1
// //     // }
//     // Finally, insert the general classification array into the MongoDB collection
//     const createGeneralClassification = await GeneralClassificationModel.create(generalClassification)
//     console.log(generalClassification)
// }

// function generateGeneralClassification() {
//     generateFirstRaceResultsForGeneralClassification()
//     generateSecondRaceResultsForGeneralClassification()
// }

// generateGeneralClassification()

// generateFirstRaceResultsForGeneralClassification()

// generateSecondRaceResultsForGeneralClassification()

// generateThirdRaceResultsForGeneralClassification()

recalculateGeneralClassificationResults()