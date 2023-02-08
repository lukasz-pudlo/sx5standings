// Express application
import express from 'express';
import formidable from 'formidable';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, parse, sep } from 'path';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const fs = require('fs');

const path = require('path');

const { check, validationResult } = require('express-validator');

// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/race', { useNewUrlParser: true });

// const generalClassificationSchema = new mongoose.Schema({
//   runner: String,
//   races: Number,
//   points: Number,
//   category: String,
//   generalPosition: Number,
//   racePositions: [Number]
// });

// Create the general classification model
// const CurrentStandingsModel = mongoose.model('CurrentStandings', generalClassificationSchema);

// const FourRacesStandingsModel = mongoose.model('FourRacesStandings', generalClassificationSchema);

// const ThreeRacesStandingsModel = mongoose.model('ThreeRacesStandings', generalClassificationSchema);

// const TwoRacesStandingsModel = mongoose.model('TwoRacesStandings', generalClassificationSchema);

// const OneRacesStandingsModel = mongoose.model('OneRacesStandings', generalClassificationSchema);

// configuration
const
  __dirname = dirname(fileURLToPath( import.meta.url )) + sep,
  cfg = {
    port: process.env.PORT || 3005,
    dir: {
      root:   __dirname,
      static: __dirname + 'static' + sep,
      views:  __dirname + 'views' + sep,
      uploads:  __dirname + 'uploads' + sep,
    }
  };

// Express initiation
const app = express();

// app.listen(cfg.port, '0.0.0.0', () => {
//   console.dir(cfg, { depth: null, color: true });
// });

console.dir(cfg, { depth: null, color: true });
  



// var mongoose=require("mongoose");
var bodyParser=require("body-parser");

// do not identify Express
app.disable('x-powered-by');
// HTTP compression
app.use( compression() );
app.use(bodyParser.urlencoded({extended:true}));

// use EJS templates
app.set('view engine', 'ejs');
app.set('views', cfg.dir.views);

// home page route
app.get('/', (req, res) => {
    res.render('home', { title: 'Acorn Trails - South by Five' });
  });

  app.get('/results/1', (req, res) => {
    fs.readFile('results/oneracesstandings.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err)
            return
        }
        try {
            const oneRacesStandings = JSON.parse(jsonString)

            oneRacesStandings.sort((a, b) => {
              if (a.points !== b.points) {
                return a.points - b.points;
              } else {
                return a.generalPosition - b.generalPosition;
              }
            });

            // oneRacesStandings.sort((a, b) => a.points - b.points);
            res.render('results', {currentGeneralClassification: oneRacesStandings, race: "King's Park"});
        } catch(err) {
            console.log('Error parsing JSON string:', err)
        }
    })
});

app.get('/results/2', (req, res) => {
  fs.readFile('results/tworacesstandings.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          let generalClassification = []
          const twoRacesStandings = JSON.parse(jsonString)

          let maleRunners = twoRacesStandings.filter(entry => entry.category.startsWith('M'));

          maleRunners.sort(function(a, b) {
              return a.points - b.points;
            });

          for (var i = 0; i < maleRunners.length; i++) {
              maleRunners[i].generalPosition = i + 1;
          }
            
          // console.log(maleRunners)

          let femaleRunners = twoRacesStandings.filter(entry => entry.category.startsWith('F'));
          femaleRunners.sort(function(a, b) {
              return a.points - b.points;
            });

          for (var i = 0; i < femaleRunners.length; i++) {
              femaleRunners[i].generalPosition = i + 1;
          }
          // console.log(femaleRunners)

          let maleAndFemaleRunners = maleRunners.concat(femaleRunners);

          maleAndFemaleRunners.forEach(runner => {
              generalClassification.push(runner);
          })

          generalClassification.sort((a, b) => {
            if (a.points !== b.points) {
              return a.points - b.points;
            } else {
              return a.generalPosition - b.generalPosition;
            }
          });

          res.render('results', {currentGeneralClassification: generalClassification, race: "Linn Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

app.get('/results/3', (req, res) => {
  fs.readFile('results/threeracesstandings.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const threeRacesStandings = JSON.parse(jsonString)

          threeRacesStandings.sort((a, b) => {
            if (a.points !== b.points) {
              return a.points - b.points;
            } else {
              return a.generalPosition - b.generalPosition;
            }
          });

          res.render('results', {currentGeneralClassification: threeRacesStandings, race: "Rouken Glen Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

app.get('/results/4', (req, res) => {
  fs.readFile('results/fourracesstandings.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const fourRacesStandings = JSON.parse(jsonString)

          fourRacesStandings.sort((a, b) => {
            if (a.points !== b.points) {
              return a.points - b.points;
            } else {
              return a.generalPosition - b.generalPosition;
            }
          });

          res.render('results', {currentGeneralClassification: fourRacesStandings, race: "Pollok Country Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

app.get('/results/5', (req, res) => {
  fs.readFile('results/fiveracesstandings.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const fiveRacesStandings = JSON.parse(jsonString)

          fiveRacesStandings.sort((a, b) => {
            if (a.points !== b.points) {
              return a.points - b.points;
            } else {
              return a.generalPosition - b.generalPosition;
            }
          });
          
          res.render('results', {currentGeneralClassification: fiveRacesStandings, race: "Bellahouston Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

// Race results views

app.get('/kings', (req, res) => {
  fs.readFile('results/kings.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const kingsResults = JSON.parse(jsonString)

          kingsResults.sort((a, b) => {
            // if (a.generalPosition !== b.generalPosition) {
            //   return a.generalPosition - b.generalPosition;
            // } else {
            //   return a.position - b.position;
            // }
            return a.position - b.position;
          });
          
          res.render('raceResults', {currentRace: kingsResults, race: "King's Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

app.get('/linn', (req, res) => {
  fs.readFile('results/linn.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const linnResults = JSON.parse(jsonString)

          linnResults.sort((a, b) => {
            // if (a.generalPosition !== b.generalPosition) {
            //   return a.generalPosition - b.generalPosition;
            // } else {
            //   return a.position - b.position;
            // }
            return a.position - b.position;
          });
          
          res.render('raceResults', {currentRace: linnResults, race: "Linn Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

app.get('/rouken', (req, res) => {
  fs.readFile('results/rouken.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const roukenResults = JSON.parse(jsonString)

          roukenResults.sort((a, b) => {
            // if (a.generalPosition !== b.generalPosition) {
            //   return a.generalPosition - b.generalPosition;
            // } else {
            //   return a.position - b.position;
            // }
            return a.position - b.position;
          });
          
          res.render('raceResults', {currentRace: roukenResults, race: "Rouken Glen Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

app.get('/pollok', (req, res) => {
  fs.readFile('results/pollok.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const pollokResults = JSON.parse(jsonString)

          pollokResults.sort((a, b) => {
            // if (a.generalPosition !== b.generalPosition) {
            //   return a.generalPosition - b.generalPosition;
            // } else {
            //   return a.position - b.position;
            // }
            return a.position - b.position;
          });
          
          res.render('raceResults', {currentRace: pollokResults, race: "Pollok Country Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

app.get('/bellahouston', (req, res) => {
  fs.readFile('results/bellahouston.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("Error reading file from disk:", err)
          return
      }
      try {
          const bellahoustonResults = JSON.parse(jsonString)

          bellahoustonResults.sort((a, b) => {
            // if (a.generalPosition !== b.generalPosition) {
            //   return a.generalPosition - b.generalPosition;
            // } else {
            //   return a.position - b.position;
            // }
            return a.position - b.position;
          });
          
          res.render('raceResults', {currentRace: bellahoustonResults, race: "Bellahouston Park"});
      } catch(err) {
          console.log('Error parsing JSON string:', err)
      }
  })
});

// about page route
app.get('/about', (req, res) => {
  res.render('about', { title: 'Acorn Trails - South by Five' });
});


  // serve static assets
app.use(express.static( cfg.dir.static ));
app.use(express.static( cfg.dir.uploads ));

// 404 error
app.use((req, res) => {
  res.status(404).send('Not found');
});

// // start server for production
// app.listen(cfg.port, '0.0.0.0', () => {
//   console.log(`Example app listening at http://0.0.0.0:${ cfg.port }`);
// });

// // start server for local development
// app.listen(cfg.port, () => {
//   console.log(`Example app listening at http://localhost:${ cfg.port }`);
// });

let host = '0.0.0.0';
app.listen(cfg.port, host, (error) => {
  if (error) {
    console.error(`Error listening on ${host}: ${error.message}`);
    host = 'localhost';
    app.listen(cfg.port, host, () => {
      console.log(`Example app listening at http://${host}:${cfg.port}`);
    });
  } else {
    console.log(`Example app listening at http://${host}:${cfg.port}`);
  }
});


// export defaults
export { cfg, app };