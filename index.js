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

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/race', { useNewUrlParser: true });

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

const FourRacesStandingsModel = mongoose.model('FourRacesStandings', generalClassificationSchema);

const ThreeRacesStandingsModel = mongoose.model('ThreeRacesStandings', generalClassificationSchema);

const TwoRacesStandingsModel = mongoose.model('TwoRacesStandings', generalClassificationSchema);

const OneRacesStandingsModel = mongoose.model('OneRacesStandings', generalClassificationSchema);

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

app.get('/results/1', async (req, res) => {
    let oneRaceStandings = await OneRacesStandingsModel.find({}).select('runner races points category generalPosition');
    oneRaceStandings.sort((a, b) => a.points - b.points);
    res.render('results', {currentGeneralClassification: oneRaceStandings, race: "King's Park"});
});

app.get('/results/2', async (req, res) => {
  let twoRaceStandings = await TwoRacesStandingsModel.find({}).select('runner races points category generalPosition');
  twoRaceStandings.sort((a, b) => a.points - b.points);
  res.render('results', {currentGeneralClassification: twoRaceStandings, race: "Linn Park"});
});

app.get('/results/3', async (req, res) => {
  let threeRaceStandings = await ThreeRacesStandingsModel.find({}).select('runner races points category generalPosition');
  threeRaceStandings.sort((a, b) => a.points - b.points);
  res.render('results', {currentGeneralClassification: threeRaceStandings, race: "Rouken Glen Park"});
});

app.get('/results/4', async (req, res) => {
  let fourRaceStandings = await FourRacesStandingsModel.find({}).select('runner races points category generalPosition');
  fourRaceStandings.sort((a, b) => a.points - b.points);
  res.render('results', {currentGeneralClassification: fourRaceStandings, race: "Pollok Park"});
});

app.get('/results/5', async (req, res) => {
    let currentGeneralClassification = await CurrentStandingsModel.find({}).select('runner races points category generalPosition');
    currentGeneralClassification.sort((a, b) => a.points - b.points);
    res.render('results', {currentGeneralClassification: currentGeneralClassification, race: "Bellahouston Park"});
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