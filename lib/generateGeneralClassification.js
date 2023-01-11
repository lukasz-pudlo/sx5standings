import { createRequire } from "module";
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

async function generateGeneralClassification() {
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
  
    // // Repeat the above steps for the second race
    // const secondRaceResults = await Race.find({name: "Lx5.xlsx"})
    // secondRaceResults.forEach(result => {
    //   let existingRunner = generalClassification.find(runner => runner.runner === result.runner)
    //   if (existingRunner) {
    //     existingRunner.races += 1
    //     existingRunner.points += result.position
    //   } else {
    //     let runner = {
    //       runner: result.runner,
    //       races: 1,
    //       points: result.position,
    //       position: null
    //     }
    //     generalClassification.push(runner)
    //   }
    // });

    // // Repeat the above steps for 3rd, 4th, 5th and 6th race as well. 

    // const thirdRaceResults = await Race.find({name: "Rx5.xlsx"})
    // thirdRaceResults.forEach(result => {
    //   let existingRunner = generalClassification.find(runner => runner.runner === result.runner)
    //   if (existingRunner) {
    //     existingRunner.races += 1
    //     existingRunner.points += result.position
    //   } else {
    //     let runner = {
    //       runner: result.runner,
    //       races: 1,
    //       points: result.position,
    //       position: null
    //     }
    //     generalClassification.push(runner)
    //   }
    // });

    // const fourthRaceResults = await Race.find({name: "Px5.xlsx"})
    // fourthRaceResults.forEach(result => {
    //   let existingRunner = generalClassification.find(runner => runner.runner === result.runner)
    //   if (existingRunner) {
    //     existingRunner.races += 1
    //     existingRunner.points += result.position
    //   } else {
    //     let runner = {
    //       runner: result.runner,
    //       races: 1,
    //       points: result.position,
    //       position: null
    //     }
    //     generalClassification.push(runner)
    //   }
    // });

    // // iterate through the general classification array and  check each runner's participation variable 
    // // if the variable is less than number of races - 1 , remove that runner name from all previous race results.
    // generalClassification = generalClassification.filter(runner => runner.races >= 4);
    // // Sort the general classification array by points and update the position field for each runner.
    // generalClassification.sort((a, b) => a.points - b.points)
    // for (let i = 0; i < generalClassification.length; i++) {
    //   generalClassification[i].position = i + 1
    // }
    // Finally, insert the general classification array into the MongoDB collection
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification)
    console.log(generalClassification)
}

generateGeneralClassification()
