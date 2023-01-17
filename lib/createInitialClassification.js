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
            generalPosition: Number,
            categoryPosition: Number,
            result: String
        }
    ]
});
const Race = mongoose.model('race', raceSchema);

// Define the general classification schema
const generalClassificationSchema = new mongoose.Schema({
  runner: String,
  races: Number,
  points: Number,
  racePositions: [Number]
});

// Create the general classification model
const CurrentStandingsModel = mongoose.model('CurrentStandings', generalClassificationSchema);

const firstRaceResults = await Race.find({name: "Kx5.xlsx"});
const secondRaceResults = await Race.find({name: "Lx5.xlsx"});
const thirdRaceResults = await Race.find({name: "Rx5.xlsx"});
const fourthRaceResults = await Race.find({name: "Px5.xlsx"});
const fifthRaceResults = await Race.find({name: "Bx5.xlsx"});

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

let fifthRaceResultsProper = []

fifthRaceResults.forEach(result => {
    for (var i = 0; i < result.results.length; i++)
    fifthRaceResultsProper.push(result.results[i]);
})

// const FirstRaceClassificationModel = mongoose.model('FirstRaceClassification', generalClassificationSchema);
// const SecondRaceClassificationModel = mongoose.model('SecondRaceClassification', generalClassificationSchema);
// const ThirdRaceClassificationModel = mongoose.model('ThirdRaceClassification', generalClassificationSchema);
// const FourthRaceClassificationModel = mongoose.model('FourthRaceClassification', generalClassificationSchema);
// const FifthRaceClassificationModel = mongoose.model('FifthRaceClassification', generalClassificationSchema);

async function addRaceResults(raceResults, firstRace = false) {
    let generalClassification = [];
    let oldGeneralClassification = await CurrentStandingsModel.find({}).select('runner gender races points racePositions');
    // console.log(oldGeneralClassification)

    if (firstRace) {
        raceResults.forEach(result => {
            let runner = {
                runner: result.runner,
                races: 1,
                points: result.generalPosition,
                racePositions: [result.generalPosition]
                }
                // Add the runner to the general classification array
                generalClassification.push(runner);
                // console.log(runner);
                // currentRace.insertMany(runner);
            })
            // console.log(generalClassification)
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
            // currentRace.insertMany(plainRunner)
        })
        // console.log(generalClassification)
        
        raceResults.forEach(result => {
            let returningRunner = oldGeneralClassification.find(runner => runner.runner === result.runner);
            if (returningRunner) {
                // console.log(existingRunner);
                returningRunner.races += 1;
                returningRunner.points += result.generalPosition;
                returningRunner.racePositions.push(result.generalPosition);
                // console.log(returningRunner);
                let plainRunner = returningRunner.toObject();
                delete plainRunner._id;
                // console.log(plainRunner);
                generalClassification.push(plainRunner);
                // console.log(plainRunner);
                // currentRace.insertMany(plainRunner)
            }
            else {
                let runner = {
                    runner: result.runner,
                    races: 1,
                    points: result.generalPosition,
                    racePositions: [result.generalPosition]
                }
                // console.log(runner);
                generalClassification.push(runner);
                // console.log(runner);
                // currentRace.insertMany(runner)
            }
        })
    }
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await CurrentStandingsModel.deleteMany({});
    // Finally, insert the general classification after the first race into the MongoDB collection
    // console.log(generalClassification)
    const createGeneralClassification = await CurrentStandingsModel.create(generalClassification);
}

async function recalculateGeneralClassificationResults(numberOfRaces) {
    
    let currentGeneralClassification = await CurrentStandingsModel.find({}).select('runner gender races points');
    // console.log(currentGeneralClassification);
    let runnersToRemove = [...currentGeneralClassification].filter(x => x.races < numberOfRaces - 1);
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

    // Retrieve fifth race results again
    let updatedFifthRaceResults = fifthRaceResultsProper.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));
    
    // console.log(updatedFourthRaceResults);

    for (var i = 0; i < updatedFifthRaceResults.length; i++) {
        // console.log([i])
        updatedFifthRaceResults[i].position = i + 1;
    }

    // console.log(updatedFourthRaceResults)

    const fifthRaceRegenerated = await addRaceResults(updatedFifthRaceResults);
}

async function removeWorstResult(numberOfRaces) {
    let finalGeneralClassification = []
    let currentGeneralClassification = await CurrentStandingsModel.find({}).select('runner races points racePositions');
    // console.log(currentGeneralClassification);

    currentGeneralClassification.forEach(result => {
        if (result.racePositions.length == numberOfRaces) {
            let worstPosition = Math.max.apply(null, result.racePositions);
            // console.log(worstPosition)
            result.points -= worstPosition;
            let plainRunner = result.toObject();
            delete plainRunner._id;
            finalGeneralClassification.push(plainRunner);
        }
        else {
            let plainRunner = result.toObject();
            delete plainRunner._id;
            finalGeneralClassification.push(plainRunner);
        }
    })
    // console.log(finalGeneralClassification)
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await CurrentStandingsModel.deleteMany({});
    // Finally, insert the general classification after the first race into the MongoDB collection
    // console.log(generalClassification)
    const createGeneralClassification = await CurrentStandingsModel.create(finalGeneralClassification);
}

async function generateResults() {
    // await addRaceResults(firstRaceResultsProper, true, FirstRaceClassificationModel);
    // await addRaceResults(secondRaceResultsProper, false, SecondRaceClassificationModel);
    // await addRaceResults(thirdRaceResultsProper, false, ThirdRaceClassificationModel);
    // await addRaceResults(fourthRaceResultsProper, false, FourthRaceClassificationModel);
    // await addRaceResults(fifthRaceResultsProper, false, FifthRaceClassificationModel);

    await addRaceResults(firstRaceResultsProper, true);
    await addRaceResults(secondRaceResultsProper);
    await addRaceResults(thirdRaceResultsProper);
    await addRaceResults(fourthRaceResultsProper);
    await addRaceResults(fifthRaceResultsProper);

    await recalculateGeneralClassificationResults(5);
    // await removeWorstResult(5);
}

generateResults();

// recalculateGeneralClassificationResults()

// removeWorstResult();