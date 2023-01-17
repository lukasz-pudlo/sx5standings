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
            gender: String,
            cat: String,
            position: Number,
            generalPosition: Number, 
            categoryPosition: Number,
            number: Number,
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
  category: String,
  generalPosition: Number,
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

let racesToUpdate = [firstRaceResultsProper, secondRaceResultsProper, thirdRaceResultsProper, fourthRaceResultsProper, fifthRaceResultsProper]
// console.log(racesToUpdate)

// const FirstRaceClassificationModel = mongoose.model('FirstRaceClassification', generalClassificationSchema);
// const SecondRaceClassificationModel = mongoose.model('SecondRaceClassification', generalClassificationSchema);
// const ThirdRaceClassificationModel = mongoose.model('ThirdRaceClassification', generalClassificationSchema);
// const FourthRaceClassificationModel = mongoose.model('FourthRaceClassification', generalClassificationSchema);
// const FifthRaceClassificationModel = mongoose.model('FifthRaceClassification', generalClassificationSchema);

async function addRaceResults(raceResults, firstRace = false) {
    let generalClassification = [];
    let oldGeneralClassification = await CurrentStandingsModel.find({}).select('runner races points category generalPosition racePositions');
    // console.log(oldGeneralClassification)

    if (firstRace) {
        raceResults.forEach(result => {
            // console.log(result)
            let runner = {
                runner: result.runner,
                races: 1,
                points: result.generalPosition,
                category: result.cat,
                generalPosition: result.generalPosition,
                racePositions: [result.generalPosition]
                }
                // Add the runner to the general classification array
                generalClassification.push(runner);
                // console.log(runner);
                // currentRace.insertMany(runner);
                // console.log(runner)
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
            // console.log(result)
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
                    category: result.cat,
                    generalPosition: result.generalPosition,
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

    let updatedRaces = []
    racesToUpdate.forEach((race, index) => {
        let updatedRaceResults = race.filter(entry => !runnersToRemoveNamesList.includes(entry.runner));

        // console.log(updatedRaceResults)

        for (var i = 0; i < updatedRaceResults.length; i++) {
            // console.log([i])
            updatedRaceResults[i].position = i + 1;
            // console.log(updatedFirstRaceResults[i])
            // console.log(updatedFirstRaceResults[i].gender)
            // console.log(typeof updatedFirstRaceResults[i].gender);
        }
        // console.log(updatedFirstRaceResults)
    
        let maleRunners = updatedRaceResults.filter(entry => entry.gender === 'M');
        // console.log(maleRunners)
        let femaleRunners = updatedRaceResults.filter(entry => entry.gender === 'F');
        // console.log(femaleRunners)
    
        
        for (var i = 0; i < maleRunners.length; i++) {
            maleRunners[i].generalPosition = i + 1;
        }
    
        
        for (var i = 0; i < femaleRunners.length; i++) {
            femaleRunners[i].generalPosition = i + 1;
        }
    
        // console.log(femaleRunners)
    
        updatedRaceResults = []
        updatedRaceResults = maleRunners.concat(femaleRunners);
        
        updatedRaces.push(updatedRaceResults);
    })  

    // console.log(updatedRaces[0])

    for (var i = 0; i < updatedRaces.length; i++) {
        if (i == 0) {
            await addRaceResults(updatedRaces[i], true)
        }
        else await addRaceResults(updatedRaces[i])
    }
}

async function removeWorstResult(numberOfRaces) {
    let finalGeneralClassification = []
    let currentGeneralClassification = await CurrentStandingsModel.find({}).select('runner races points generalPosition racePositions');
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

async function correctGeneralPositions() {
    let generalClassification = [];

    let currentStandings = await CurrentStandingsModel.find({}).select('runner races points category generalPosition racePositions');
    // console.log(currentStandings);
    let maleRunners = currentStandings.filter(entry => entry.category.startsWith('M'));

    maleRunners.sort(function(a, b) {
        return a.points - b.points;
      });

    for (var i = 0; i < maleRunners.length; i++) {
        maleRunners[i].generalPosition = i + 1;
    }
      
    // console.log(maleRunners)

    let femaleRunners = currentStandings.filter(entry => entry.category.startsWith('F'));
    femaleRunners.sort(function(a, b) {
        return a.points - b.points;
      });

    for (var i = 0; i < femaleRunners.length; i++) {
        femaleRunners[i].generalPosition = i + 1;
    }
    // console.log(femaleRunners)

    let maleAndFemaleRunners = maleRunners.concat(femaleRunners);

    maleAndFemaleRunners.forEach(runner => {
        let plainRunner = runner.toObject();
        delete plainRunner._id;
        // console.log(plainRunner);
        generalClassification.push(plainRunner);
    })
    //Remove all documents from the GeneralClassification collection
    const deleteManyResult = await CurrentStandingsModel.deleteMany({});
    // Finally, insert the general classification after the first race into the MongoDB collection
    // console.log(generalClassification)
    const createGeneralClassification = await CurrentStandingsModel.create(generalClassification);
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

// generateResults();

// recalculateGeneralClassificationResults(5)

// removeWorstResult();

correctGeneralPositions();

