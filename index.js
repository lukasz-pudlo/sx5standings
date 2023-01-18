// Express application
import express from 'express';
import formidable from 'formidable';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, parse, sep } from 'path';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

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

  console.dir(cfg, { depth: null, color: true });

  // Express initiation
const app = express();

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
            oneRacesStandings.sort((a, b) => a.points - b.points);
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
          const twoRacesStandings = JSON.parse(jsonString)
          twoRacesStandings.sort((a, b) => a.points - b.points);
          res.render('results', {currentGeneralClassification: twoRacesStandings, race: "Linn Park"});
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
          threeRacesStandings.sort((a, b) => a.points - b.points);
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
          fourRacesStandings.sort((a, b) => a.points - b.points);
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
          fiveRacesStandings.sort((a, b) => a.points - b.points);
          res.render('results', {currentGeneralClassification: fiveRacesStandings, race: "Bellahouston Park"});
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

// start server
app.listen(cfg.port, () => {
  console.log(`Example app listening at http://localhost:${ cfg.port }`);
});

// export defaults
export { cfg, app };