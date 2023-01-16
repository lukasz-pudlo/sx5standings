import { createRequire } from "module";
import { finished } from "stream";
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/race', { useNewUrlParser: true });

const raceSchema = new mongoose.Schema({
    name: String,
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

async function generateFirstRaceResultsForGeneralClassification(raceResults = null) {
    let generalClassification = [];

    if (raceResults) {
        // console.log(raceResults);
        raceResults.forEach(result => {
            let runner = {
                runner: result.runner,
                races: 1,
                points: result.position,
              }
              // console.log(runner);
              // Add the runner to the general classification array
              generalClassification.push(runner);
        })
    }

    else {
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
    }
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await GeneralClassificationModel.deleteMany({});
    // Finally, insert the general classification after the first race into the MongoDB collection
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
}

async function generateSecondRaceResultsForGeneralClassification(raceResults = null) {
    // At this point, all runners from the first and the second race are in the general classification
    // Repeat the above steps for the second race
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');

    if (raceResults) {
        // console.log(oldGeneralClassification);
        // console.log(raceResults);
        raceResults.forEach(result => {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.runner);
            if (existingRunner) {
                // console.log(existingRunner);
                existingRunner.races += 1;
                existingRunner.points += result.position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                // console.log(plainRunner);
                generalClassification.push(plainRunner);
                // console.log(plainRunner);
            }
            else {
                let runner = {
                    runner: result.runner,
                    races: 1,
                    points: result.position,
                }
                // console.log(runner);
                generalClassification.push(runner);
                // console.log(runner);
            }
        })
        // console.log(generalClassification);

        // //Remove all documents from the GeneralClassification collection
        // const deleteManyResult = await GeneralClassificationModel.deleteMany({});
        // // Finally, insert the general classification after the first race into the MongoDB collection
        // const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
    }

    else {
        const secondRaceResults = await Race.find({name: "Lx5.xlsx"});

        let secondRaceResultsProper = []
        
        secondRaceResults.forEach(result => {
            for (var i = 0; i < result.results.length; i++)
                secondRaceResultsProper.push(result.results[i]);
        })

        // console.log(secondRaceResultsProper);

        secondRaceResultsProper.forEach(result => {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.runner);
            if (existingRunner) {
                // console.log(existingRunner);
                existingRunner.races += 1;
                existingRunner.points += result.position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                // console.log(plainRunner);
                generalClassification.push(plainRunner);
                // console.log(plainRunner);
            }
            else {
                let runner = {
                    runner: result.runner,
                    races: 1,
                    points: result.position,
                }
                // console.log(runner);
                generalClassification.push(runner);
                // console.log(runner);
            }
        })

        // // Create a list of runners that only took part in the first race
        // secondRaceResults.forEach(result => {
        //     let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        //     let newRunnerNames = new Set(result.results.map(x => x.runner));
        //     let firstRaceOnlyRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
        //     // Add to general classification runners that only took part in the first race. 
        //     oldGeneralClassification.forEach(runner => {
        //         if (firstRaceOnlyRunners.includes(runner.runner)) {
        //             let plainRunner = runner.toObject();
        //             delete plainRunner._id;
        //             generalClassification.push(plainRunner);
        //         }
        //     })
        //     for (var i = 0; i < result.results.length; i++) {
        //         let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.results[i].runner);
        //         if (existingRunner) {
        //             existingRunner.races += 1;
        //             existingRunner.points += result.results[i].position;
        //             let plainRunner = existingRunner.toObject();
        //             delete plainRunner._id;
        //             generalClassification.push(plainRunner);
        //         } 
        //         else {
        //             let runner = {
        //                 runner: result.results[i].runner,
        //                 races: 1,
        //                 points: result.results[i].position,
        //             }
        //             generalClassification.push(runner);
        //         }
        //     }
        // });
    }

    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await GeneralClassificationModel.deleteMany({});
    // Create updated general classification
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
}

async function generateThirdRaceResultsForGeneralClassification(raceResults = null) {
    // At this point, first and second race results need to be updated, which will lead to the general classification being updated, 
    // before the third race results are added to the general classification
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    // console.log(oldGeneralClassification);
    
    if (raceResults) {
        raceResults.forEach(result => {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.runner);
            if (existingRunner) {
                // console.log(existingRunner);
                existingRunner.races += 1;
                existingRunner.points += result.position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                // console.log(plainRunner);
                generalClassification.push(plainRunner);
                // console.log(plainRunner);
            }
            // At this stage, if someone hasn't run at least one race, 
            // they can't be included in the general classification
            // else {
            //     let runner = {
            //         runner: result.runner,
            //         races: 1,
            //         points: result.position,
            //     }
            //     console.log(runner);
            //     generalClassification.push(runner);
            //     // console.log(runner);
            // }
        })
    }

    else {
        const thirdRaceResults = await Race.find({name: "Rx5.xlsx"});

        let thirdRaceResultsProper = []
        
        thirdRaceResults.forEach(result => {
            for (var i = 0; i < result.results.length; i++)
                thirdRaceResultsProper.push(result.results[i]);
        })

        // console.log(secondRaceResultsProper);

        thirdRaceResultsProper.forEach(result => {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.runner);
            if (existingRunner) {
                // console.log(existingRunner);
                existingRunner.races += 1;
                existingRunner.points += result.position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                // console.log(plainRunner);
                generalClassification.push(plainRunner);
                // console.log(plainRunner);
            }
            else {
                let runner = {
                    runner: result.runner,
                    races: 1,
                    points: result.position,
                }
                // console.log(runner);
                generalClassification.push(runner);
                // console.log(runner);
            }
        })




        // thirdRaceResults.forEach(result => {
        //     let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        //     let newRunnerNames = new Set(result.results.map(x => x.runner));
        //     let previousRacesRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
        //     // console.log(firstAndSecondRaceOnlyRunners)
        //     // Add to general classification runners that took part in the first only, second race only, or both, but didn't take part
        //     // in the third race
        //     oldGeneralClassification.forEach(runner => {
        //         if (previousRacesRunners.includes(runner.runner)) {
        //             let plainRunner = runner.toObject();
        //             delete plainRunner._id;
        //             generalClassification.push(plainRunner);
        //         }
        //     })
        //     // Add runners that took part in the third race and in one or both of the previous races
        //     for (var i = 0; i < result.results.length; i++) {
        //         let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.results[i].runner);
        //         if (existingRunner) {
        //             existingRunner.races += 1;
        //             existingRunner.points += result.results[i].position;
        //             let plainRunner = existingRunner.toObject();
        //             delete plainRunner._id;
        //             generalClassification.push(plainRunner);
        //         } 
        //         // Add runners that took part only in the third race. 
        //         else {
        //             let runner = {
        //                 runner: result.results[i].runner,
        //                 races: 1,
        //                 points: result.results[i].position,
        //             }
        //             generalClassification.push(runner);
        //         }
        //     }
        // });




        // // Create a list of runners that only took part in the first race
        // thirdRaceResults.forEach(result => {
        //     let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        //     let newRunnerNames = new Set(result.results.map(x => x.runner));
        //     let firstAndSecondRaceOnlyRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
        //     // console.log(firstAndSecondRaceOnlyRunners)
        //     // Add to general classification runners that took part in the first only, second race only, or both, but didn't take part
        //     // in the third race
        //     oldGeneralClassification.forEach(runner => {
        //         if (firstAndSecondRaceOnlyRunners.includes(runner.runner)) {
        //             let plainRunner = runner.toObject();
        //             delete plainRunner._id;
        //             generalClassification.push(plainRunner);
        //         }
        //     })
        //     // Add runners that took part in the third race and in one or both of the previous races
        //     for (var i = 0; i < result.results.length; i++) {
        //         let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.results[i].runner);
        //         if (existingRunner) {
        //             existingRunner.races += 1;
        //             existingRunner.points += result.results[i].position;
        //             let plainRunner = existingRunner.toObject();
        //             delete plainRunner._id;
        //             generalClassification.push(plainRunner);
        //         } 
        //         // Add runners that took part only in the third race. 
        //         else {
        //             let runner = {
        //                 runner: result.results[i].runner,
        //                 races: 1,
        //                 points: result.results[i].position,
        //             }
        //             generalClassification.push(runner);
        //         }
        //     }
        // });
    }
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await GeneralClassificationModel.deleteMany({});
    // Finally, insert the general classification after the first race into the MongoDB collection
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
}

async function generateFourthRaceResultsForGeneralClassification(raceResults = null) {
        // At this point, first and second race results need to be updated, which will lead to the general classification being updated, 
    // before the third race results are added to the general classification
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    // console.log(oldGeneralClassification);
    
    if (raceResults) {
        raceResults.forEach(result => {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.runner);
            if (existingRunner) {
                // console.log(existingRunner);
                existingRunner.races += 1;
                existingRunner.points += result.position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                // console.log(plainRunner);
                generalClassification.push(plainRunner);
                // console.log(plainRunner);
            }
            // At this stage, no runners with 1 race under their belt are allowed
            // else {
            //     let runner = {
            //         runner: result.runner,
            //         races: 1,
            //         points: result.position,
            //     }
            //     console.log(runner);
            //     generalClassification.push(runner);
            //     // console.log(runner);
            // }
        })
    }

    else {
        const fourthRaceResults = await Race.find({name: "Px5.xlsx"});

        let fourthRaceResultsProper = []
        
        fourthRaceResults.forEach(result => {
            for (var i = 0; i < result.results.length; i++)
                fourthRaceResultsProper.push(result.results[i]);
        })

        // console.log(secondRaceResultsProper);

        fourthRaceResultsProper.forEach(result => {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.runner);
            if (existingRunner) {
                // console.log(existingRunner);
                existingRunner.races += 1;
                existingRunner.points += result.position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                // console.log(plainRunner);
                generalClassification.push(plainRunner);
                // console.log(plainRunner);
            }
            else {
                let runner = {
                    runner: result.runner,
                    races: 1,
                    points: result.position,
                }
                // console.log(runner);
                generalClassification.push(runner);
                // console.log(runner);
            }
        })
        
        
        
        
        
        
        // // Create a list of runners that only took part in the first race
        // fourthRaceResults.forEach(result => {
        //     let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        //     let newRunnerNames = new Set(result.results.map(x => x.runner));
        //     let previousRacesRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
        //     // console.log(firstAndSecondRaceOnlyRunners)
        //     // Add to general classification runners that took part in the first only, second race only, or both, but didn't take part
        //     // in the third race
        //     oldGeneralClassification.forEach(runner => {
        //         if (previousRacesRunners.includes(runner.runner)) {
        //             let plainRunner = runner.toObject();
        //             delete plainRunner._id;
        //             generalClassification.push(plainRunner);
        //         }
        //     })
        //     // Add runners that took part in the third race and in one or both of the previous races
        //     for (var i = 0; i < result.results.length; i++) {
        //         let existingRunner = oldGeneralClassification.find(runner => runner.runner === result.results[i].runner);
        //         if (existingRunner) {
        //             existingRunner.races += 1;
        //             existingRunner.points += result.results[i].position;
        //             let plainRunner = existingRunner.toObject();
        //             delete plainRunner._id;
        //             generalClassification.push(plainRunner);
        //         } 
        //         // Add runners that took part only in the third race. 
        //         else {
        //             let runner = {
        //                 runner: result.results[i].runner,
        //                 races: 1,
        //                 points: result.results[i].position,
        //             }
        //             generalClassification.push(runner);
        //         }
        //     }
        // });
    }
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await GeneralClassificationModel.deleteMany({});
    // Finally, insert the general classification after the first race into the MongoDB collection
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
}

async function recalculateGeneralClassificationResults() {
    
    let currentGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    // console.log(currentGeneralClassification);
    let runnersToRemove = [...currentGeneralClassification].filter(x => x.races < 3);
    // console.log(runnersToRemove)
    let runnersToRemoveNames = new Set(runnersToRemove.map(x => x.runner));
    // console.log(runnersToRemoveNames);
    let runnersToRemoveNamesList = Array.from(runnersToRemoveNames);
    // console.log(`Names of runners to remove: ${runnersToRemoveNamesList}`);

    // Retrieve first race results again
    const firstRaceResults = await Race.find({name: "Kx5.xlsx"});
    // console.log(firstRaceResults[0])
    let updatedFirstRaceResults = [];
    firstRaceResults.forEach(result => {
        // console.log(result.results)
        updatedFirstRaceResults = result.results.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
        // console.log(result.results);
    })
    // console.log(updatedFirstRaceResults)

    const firstRaceRegenerated = await generateFirstRaceResultsForGeneralClassification(updatedFirstRaceResults);

    
    // Retrieve second race results again
    const secondRaceResults = await Race.find({name: "Lx5.xlsx"});
    // console.log(secondRaceResults)
    let updatedSecondRaceResults = [];
    // console.log(runnersToRemoveNamesList)

    secondRaceResults.forEach(result => {
        // console.log(result.results)
        updatedSecondRaceResults = result.results.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
        // console.log(result.results);
    })
    // console.log(updatedSecondRaceResults);

    const secondRaceRegenerated = await generateSecondRaceResultsForGeneralClassification(updatedSecondRaceResults);

    // Retrieve third race results again
    const thirdRaceResults = await Race.find({name: "Rx5.xlsx"});
    let updatedThirdRaceResults = []

    thirdRaceResults.forEach(result => {
        // console.log(result.results)
        updatedThirdRaceResults = result.results.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
        // console.log(updatedThirdRaceResults);
    })
    // console.log(updatedSecondRaceResults);


    const thirdRaceRegenerated = await generateThirdRaceResultsForGeneralClassification(updatedThirdRaceResults);


    // Retrieve fourth race results again
    const fourthRaceResults = await Race.find({name: "Px5.xlsx"});
    let updatedFourthRaceResults = []
    
    fourthRaceResults.forEach(result => {
        // console.log(result.results)
        updatedFourthRaceResults = result.results.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
        // console.log(updatedFourthRaceResults);
    })
    // console.log(updatedFourthRaceResults);

    const fourthRaceRegenerated = await generateFourthRaceResultsForGeneralClassification(updatedFourthRaceResults);
}

async function generateResults() {
    const firstRace = await generateFirstRaceResultsForGeneralClassification();
    const secondRace = await generateSecondRaceResultsForGeneralClassification()
    const thirdRace = await generateThirdRaceResultsForGeneralClassification();
    const fourthRace = await generateFourthRaceResultsForGeneralClassification();
    // const recalculate = await recalculateGeneralClassificationResults();
}

generateResults();

// const recalculate = await recalculateGeneralClassificationResults();