import { createRequire } from "module";
import { finished } from "stream";
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/race', { useNewUrlParser: true });

const raceSchema = new mongoose.Schema({
    name: String,
    date: String,
    location: String,
    raceNumber: Number,
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

const firstRaceResults = await Race.find({name: "Kx5.xlsx"});
const secondRaceResults = await Race.find({name: "Lx5.xlsx"});
const thirdRaceResults = await Race.find({name: "Rx5.xlsx"});
const fourthRaceResults = await Race.find({name: "Px5.xlsx"});

let firstRaceResultsProper = []

firstRaceResults.forEach(result => {
    for (var i = 0; i < result.results.length; i++)
    firstRaceResultsProper.push(result.results[i]);
})

let secondRaceResultsProper = []

secondRaceResults.forEach(result => {
    for (var i = 0; i < result.results.length; i++)
    secondRaceResultsProper.push(result.results[i]);
})

let thirdRaceResultsProper = []

thirdRaceResults.forEach(result => {
    for (var i = 0; i < result.results.length; i++)
    thirdRaceResultsProper.push(result.results[i]);
})

let fourthRaceResultsProper = []

fourthRaceResults.forEach(result => {
    for (var i = 0; i < result.results.length; i++)
    fourthRaceResultsProper.push(result.results[i]);
})

async function addRaceResults(raceResults, firstRace = false) {
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    
    raceResults.forEach(result => {
        if (firstRace) {
            let runner = {
                runner: result.runner,
                races: 1,
                points: result.position,
                }
                // console.log(runner);
                // Add the runner to the general classification array
                generalClassification.push(runner);
        }
        else {
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
        }
    })
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await GeneralClassificationModel.deleteMany({});
    // Finally, insert the general classification after the first race into the MongoDB collection
    const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
}

async function generateResults() {
    const firstRace = await addRaceResults(firstRaceResultsProper, true);
    const secondRace = await addRaceResults(secondRaceResultsProper);
    const thirdRace = await addRaceResults(thirdRaceResultsProper);
    const fourthRace = await addRaceResults(fourthRaceResultsProper);
}

generateResults();