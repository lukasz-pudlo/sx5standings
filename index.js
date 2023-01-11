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

// // Connecting to database
// mongoose.connect("mongodb://localhost/sx5",{
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true
// });

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
    res.render('message', { title: 'Hello World!' });
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