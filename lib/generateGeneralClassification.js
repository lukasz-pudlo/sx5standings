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
        //Remove all documents from the GeneralClassification collection
        const deleteManyResult = await GeneralClassificationModel.deleteMany({});
        // Finally, insert the general classification after the first race into the MongoDB collection
        const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
        // console.log(generalClassification);
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
        //Remove all documents from the GeneralClassification collection
        const deleteManyResult = await GeneralClassificationModel.deleteMany({});
        // Finally, insert the general classification after the first race into the MongoDB collection
        const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
    }
}

async function generateSecondRaceResultsForGeneralClassification(raceResults = null) {
    // At this point, all runners from the first and the second race are in the general classification
    // Repeat the above steps for the second race
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');

    if (raceResults) {
        let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        let newRunnerNames = new Set(raceResults.map(x => x.runner));
        let firstRaceOnlyRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
        oldGeneralClassification.forEach(runner => {
            if (firstRaceOnlyRunners.includes(runner.runner)) {
                let plainRunner = runner.toObject();
                delete plainRunner._id;
                generalClassification.push(plainRunner);
            }
        })
        for (var i = 0; i < raceResults.length; i++) {
            let existingRunner = oldGeneralClassification.find(runner => runner.runner === raceResults[i].runner);
            if (existingRunner) {
                existingRunner.races += 1;
                existingRunner.points += raceResults[i].position;
                let plainRunner = existingRunner.toObject();
                delete plainRunner._id;
                generalClassification.push(plainRunner);
            } 
            else {
                let runner = {
                    runner: raceResults[i].runner,
                    races: 1,
                    points: raceResults[i].position,
                }
                generalClassification.push(runner);
            }
        }
        //Remove all documents from the GeneralClassification collection
        const deleteManyResult = await GeneralClassificationModel.deleteMany({});
        // Finally, insert the general classification after the first race into the MongoDB collection
        const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
    }

    else {
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
    }

    // //Remove all documents from the GeneralClassification collection
    // const deleteManyResult = await GeneralClassificationModel.deleteMany({});
    // // Create updated general classification
    // const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
}

async function generateThirdRaceResultsForGeneralClassification(raceResults = null) {
    // At this point, first and second race results need to be updated, which will lead to the general classification being updated, 
    // before the third race results are added to the general classification
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    // console.log(oldGeneralClassification);
    
    if (raceResults) {
        let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        let newRunnerNames = new Set(raceResults.map(x => x.runner));
        let firstAndSecondRaceOnlyRunners = [...oldRunnerNames].filter(x => x.races == 2);
        let firstAndSecondRaceOnlyRunnersQualifying = [...firstAndSecondRaceOnlyRunners].filter(x => !newRunnerNames.has(x));

        let firstAndSecondRaceOnlyRunnersQualifyingSet = new Set(firstAndSecondRaceOnlyRunnersQualifying.map(x => x.runner));
        let firstAndSecondRaceOnlyRunnersQualifyingList = Array.from(firstAndSecondRaceOnlyRunnersQualifyingSet)

        console.log(firstAndSecondRaceOnlyRunnersQualifyingList)
        // console.log(firstAndSecondRaceOnlyRunners)
        // Add to general classification runners that took part in the first only, second race only, or both, but didn't take part
        // in the third race
        oldGeneralClassification.forEach(runner => {
            if (firstAndSecondRaceOnlyRunnersQualifyingList.includes(runner.runner)) {
                let plainRunner = runner.toObject();
                delete plainRunner._id;
                generalClassification.push(plainRunner);
            }
        })
        let oneRaceRunners = [...oldRunnerNames].filter(x => x.races === 1);
        // Add runners that took part in the third race and in one or both of the previous races
        for (var i = 0; i < raceResults.length; i++) {
            if (oneRaceRunners.includes(raceResults[i])) {
                let existingRunner = oldGeneralClassification.find(runner => runner.runner === raceResults[i].runner);
                if (existingRunner) {
                    existingRunner.races += 1;
                    existingRunner.points += raceResults[i].position;
                    let plainRunner = existingRunner.toObject();
                    delete plainRunner._id;
                    generalClassification.push(plainRunner);
                } 
            }
            
            // Add runners that took part only in the third race. 
            // else {
            //     let runner = {
            //         runner: raceResults[i].runner,
            //         races: 1,
            //         points: raceResults[i].position,
            //     }
            //     generalClassification.push(runner);
            // }
        }
        //Remove all documents from the GeneralClassification collection
        const deleteManyResult = await GeneralClassificationModel.deleteMany({});
        // Finally, insert the general classification after the first race into the MongoDB collection
        const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
    }

    else {
        const thirdRaceResults = await Race.find({name: "Rx5.xlsx"});

        // Create a list of runners that only took part in the first race
        thirdRaceResults.forEach(result => {
            let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
            let newRunnerNames = new Set(result.results.map(x => x.runner));
            let firstAndSecondRaceOnlyRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
            // console.log(firstAndSecondRaceOnlyRunners)
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
        // Finally, insert the general classification after the first race into the MongoDB collection
        const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
    }

    // At this point, the general classification contains runners that shouldn't be counted towards it because
    // they took part in fewer than 2 races
    // The general classification needs to be checked to identify runners that participated in fewer than 2 races
    // These runners will then have to be removed from the first race results and second race results 
    // and the general classification needs to be recalculated
}

async function generateFourthRaceResultsForGeneralClassification(raceResults = null) {
        // At this point, first and second race results need to be updated, which will lead to the general classification being updated, 
    // before the third race results are added to the general classification
    let generalClassification = [];
    let oldGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    // console.log(oldGeneralClassification);
    
    if (raceResults) {

        let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
        let newRunnerNames = new Set(raceResults.map(x => x.runner));
        let previousRacesRunners = [...oldRunnerNames].filter(x => x.races > 2);
        let previousRacesOnlyRunners = [...previousRacesRunners].filter(x => !newRunnerNames.has(x));

        let previousRacesRunnersSet = new Set(previousRacesRunners.map(x => x.runner));
        let previousRacesRunnersList = Array.from(previousRacesRunnersSet);

        let previousRacesOnlyRunnersSet = new Set(previousRacesOnlyRunners.map(x => x.runner));
        let previousRacesOnlyRunnersList = Array.from(previousRacesOnlyRunnersSet);
        // console.log(firstAndSecondRaceOnlyRunners)
        // Add to general classification runners that took part in the first only, second race only, or both, but didn't take part
        // in the third race
        oldGeneralClassification.forEach(runner => {
            if (previousRacesOnlyRunnersList.includes(runner.runner)) {
                let plainRunner = runner.toObject();
                delete plainRunner._id;
                generalClassification.push(plainRunner);
            }
        })
        // Add runners that took part in the third race and in one or both of the previous races
        for (var i = 0; i < raceResults.length; i++) {
            if (previousRacesRunnersList.includes(raceResults[i].name)) {
                let existingRunner = oldGeneralClassification.find(runner => runner.runner === raceResults[i].runner);
                if (existingRunner) {
                    existingRunner.races += 1;
                    existingRunner.points += raceResults[i].position;
                    let plainRunner = existingRunner.toObject();
                    delete plainRunner._id;
                    generalClassification.push(plainRunner);
                } 
            }
            // Add runners that took part only in the third race. 
            // else {
            //     let runner = {
            //         runner: raceResults[i].runner,
            //         races: 1,
            //         points: raceResults[i].position,
            //     }
            //     generalClassification.push(runner);
            // }
        }
        //Remove all documents from the GeneralClassification collection
        const deleteManyResult = await GeneralClassificationModel.deleteMany({});
        // Finally, insert the general classification after the first race into the MongoDB collection
        const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
    }

    else {
        const fourthRaceResults = await Race.find({name: "Px5.xlsx"});

        // Create a list of runners that only took part in the first race
        fourthRaceResults.forEach(result => {
            let oldRunnerNames = new Set(oldGeneralClassification.map(x => x.runner));
            let newRunnerNames = new Set(result.results.map(x => x.runner));
            let previousRacesRunners = [...oldRunnerNames].filter(x => !newRunnerNames.has(x));
            // console.log(firstAndSecondRaceOnlyRunners)
            // Add to general classification runners that took part in the first only, second race only, or both, but didn't take part
            // in the third race
            oldGeneralClassification.forEach(runner => {
                if (previousRacesRunners.includes(runner.runner)) {
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
        // Finally, insert the general classification after the first race into the MongoDB collection
        const createGeneralClassification = await GeneralClassificationModel.create(generalClassification);
    }
}

async function recalculateGeneralClassificationResults() {
    
    let currentGeneralClassification = await GeneralClassificationModel.find({}).select('runner races points');
    // console.log(currentGeneralClassification);
    let runnersToRemove = [...currentGeneralClassification].filter(x => x.races < 3);
    // console.log(runnersToRemove)
    let runnersToRemoveNames = new Set(runnersToRemove.map(x => x.runner));
    // console.log(runnersToRemoveNames);
    let runnersToRemoveNamesList = Array.from(runnersToRemoveNames);
    // console.log(runnersToRemoveNamesList);

    // Retrieve first race results again
    const firstRaceResults = await Race.find({name: "Kx5.xlsx"});
    // console.log(firstRaceResults[0])
    let updatedFirstRaceResults = [];
    firstRaceResults.forEach(result => {
        // console.log(result.results)
        let firstRaceResultsWithoutId = [];
        for (var i = 0; i < result.results.length; i++) {
            
            if (runnersToRemoveNamesList.includes(result.results[i].runner)) {
                result.results.splice([i], 1);
                // Make sure runners are sorted by positions. Remove runner from the first race results. Change positions based on
                // index positions after the eligible runners have been removed
                // console.log(result.results[i].runner)
            }
            if (result.results[i] !== undefined) {
                let plainRunner = result.results[i].toObject();
                // console.log(plainRunner);
                delete plainRunner._id;
                firstRaceResultsWithoutId.push(plainRunner);
                // console.log(plainRunner);
            }
        }

        updatedFirstRaceResults = firstRaceResultsWithoutId.map((runner, index) => {
            runner.position = index + 1;
            return runner;
        })
        // console.log(updatedFirstRaceResults);
    })

    const firstRaceRegenerated = await generateFirstRaceResultsForGeneralClassification(updatedFirstRaceResults);

    
    // Retrieve second race results again
    const secondRaceResults = await Race.find({name: "Lx5.xlsx"});
    // console.log(secondRaceResults)
    let updatedSecondRaceResults = [];
    secondRaceResults.forEach(result => {
        // console.log(result.results)
        let secondRaceResultsWithoutId = [];
        for (var i = 0; i < result.results.length; i++) {
            
            if (runnersToRemoveNamesList.includes(result.results[i].runner)) {
                // console.log(result.results[i]);
                result.results.splice([i], 1);
                // Make sure runners are sorted by positions. Remove runner from the first race results. Change positions based on
                // index positions after the eligible runners have been removed
                // console.log(result.results[i].runner)
            }
            if (result.results[i] !== undefined) {
                let plainRunner = result.results[i].toObject();
                delete plainRunner._id;
                secondRaceResultsWithoutId.push(plainRunner);
                // console.log(plainRunner);
            }
        }

        updatedSecondRaceResults = secondRaceResultsWithoutId.map((runner, index) => {
            runner.position = index + 1;
            return runner;
        })
        // console.log(updatedSecondRaceResults);
    })

    // const secondRaceRegenerated = await generateSecondRaceResultsForGeneralClassification(updatedSecondRaceResults);

    // // Retrieve third race results again
    // const thirdRaceResults = await Race.find({name: "Rx5.xlsx"});
    // // console.log(firstRaceResults[0])
    // let updatedThirdRaceResults = []
    // thirdRaceResults.forEach(result => {
    //     // console.log(result.results)
    //     let thirdRaceResultsWithoutId = [];
    //     for (var i = 0; i < result.results.length; i++) {
            
    //         if (runnersToRemoveNamesList.includes(result.results[i].runner)) {
    //             result.results.splice([i], 1);
    //             // Make sure runners are sorted by positions. Remove runner from the first race results. Change positions based on
    //             // index positions after the eligible runners have been removed
    //             // console.log(result.results[i].runner)
    //         }
    //         if (result.results[i] !== undefined) {
    //             let plainRunner = result.results[i].toObject();
    //             delete plainRunner._id;
    //             thirdRaceResultsWithoutId.push(plainRunner);
    //         }
    //     }

    //     updatedThirdRaceResults = thirdRaceResultsWithoutId.map((runner, index) => {
    //         runner.position = index + 1;
    //         return runner;
    //     })
        
    // })

    // const thirdRaceRegenerated = await generateThirdRaceResultsForGeneralClassification(updatedThirdRaceResults);


    // // Retrieve third race results again
    // const fourthRaceResults = await Race.find({name: "Px5.xlsx"});
    // // console.log(firstRaceResults[0])
    // let updatedFourthRaceResults = []
    // fourthRaceResults.forEach(result => {
    //     // console.log(result.results)
    //     let fourthRaceResultsWithoutId = [];
    //     for (var i = 0; i < result.results.length; i++) {
            
    //         if (runnersToRemoveNamesList.includes(result.results[i].runner)) {
    //             result.results.splice([i], 1);
    //             // Make sure runners are sorted by positions. Remove runner from the first race results. Change positions based on
    //             // index positions after the eligible runners have been removed
    //             // console.log(result.results[i].runner)
    //         }
    //         if (result.results[i] !== undefined) {
    //             let plainRunner = result.results[i].toObject();
    //             delete plainRunner._id;
    //             fourthRaceResultsWithoutId.push(plainRunner);
    //         }
    //     }

    //     updatedFourthRaceResults = fourthRaceResultsWithoutId.map((runner, index) => {
    //         runner.position = index + 1;
    //         return runner;
    //     })
        
    // })

    // const fourthRaceRegenerated = await generateFourthRaceResultsForGeneralClassification(updatedFourthRaceResults);
}

async function generateResults() {
    const firstRace = await generateFirstRaceResultsForGeneralClassification();
    const secondRace = await generateSecondRaceResultsForGeneralClassification()
    const thirdRace = await generateThirdRaceResultsForGeneralClassification();
    const fourthRace = await generateFourthRaceResultsForGeneralClassification();
    const recalculate = await recalculateGeneralClassificationResults();
}

generateResults();

// const recalculate = await recalculateGeneralClassificationResults();