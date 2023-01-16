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
    // console.log(oldGeneralClassification)

    if (firstRace) {
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
        // Create an array of runners in the current race
        const runnersInRace = raceResults.map(result => result.runner);
        // Filter the old general classification to only include runners that are not in the current race
        const filteredOldGC = oldGeneralClassification.filter(entry => !runnersInRace.includes(entry.runner));
        // console.log(filteredOldGC)
        // let existingRunner = oldGeneralClassification.find(runner => runner.runner !== result.runner);
        filteredOldGC.forEach(result => {
            let plainRunner = result.toObject();
                delete plainRunner._id;
                // console.log(plainRunner);
                generalClassification.push(plainRunner);
                // console.log(plainRunner);  
        })
        // console.log(generalClassification)
        
        raceResults.forEach(result => {
            let returningRunner = oldGeneralClassification.find(runner => runner.runner === result.runner);
            if (returningRunner) {
                // console.log(existingRunner);
                returningRunner.races += 1;
                returningRunner.points += result.position;
                let plainRunner = returningRunner.toObject();
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


    let updatedFirstRaceResults = firstRaceResultsProper.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
    for (var i = 0; i < updatedFirstRaceResults.length; i++) {
        // console.log([i])
        updatedFirstRaceResults[i].position = i + 1;
    }
    // console.log(updatedFirstRaceResults)

    const firstRaceRegenerated = await addRaceResults(updatedFirstRaceResults, true);

    let updatedSecondRaceResults = secondRaceResultsProper.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
    // console.log(runnersToRemoveNamesList)
    for (var i = 0; i < updatedSecondRaceResults.length; i++) {
        // console.log([i])
        updatedSecondRaceResults[i].position = i + 1;
    }

    
    // console.log(updatedSecondRaceResults);

    const secondRaceRegenerated = await addRaceResults(updatedSecondRaceResults);

    // Retrieve third race results again
    let updatedThirdRaceResults = thirdRaceResultsProper.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
    // console.log(updatedSecondRaceResults);

    for (var i = 0; i < updatedThirdRaceResults.length; i++) {
        // console.log([i])
        updatedThirdRaceResults[i].position = i + 1;
    }

    const thirdRaceRegenerated = await addRaceResults(updatedThirdRaceResults);


    // Retrieve fourth race results again
    let updatedFourthRaceResults = fourthRaceResultsProper.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
    
    // console.log(updatedFourthRaceResults);

    for (var i = 0; i < updatedFourthRaceResults.length; i++) {
        // console.log([i])
        updatedFourthRaceResults[i].position = i + 1;
    }

    // console.log(updatedFourthRaceResults)

    const fourthRaceRegenerated = await addRaceResults(updatedFourthRaceResults);
}




async function generateResults() {
    const firstRace = await addRaceResults(firstRaceResultsProper, true);
    const secondRace = await addRaceResults(secondRaceResultsProper);
    const thirdRace = await addRaceResults(thirdRaceResultsProper);
    const fourthRace = await addRaceResults(fourthRaceResultsProper);
    const recalculate = await recalculateGeneralClassificationResults();
}

generateResults();

// recalculateGeneralClassificationResults()