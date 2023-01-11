import { createRequire } from "module";
const require = createRequire(import.meta.url);

const XLSX = require('xlsx');

const workbook = XLSX.readFile('./results/1.Kx5-22-results.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

const resultData = data.map(row => {

    return {
        forename: row['Forename'],
        surname: row['Surname'],
        gender: row['Gender'],
        club: row['Club'],
        cat: row['Cat'],
        no: row['No.'],
        result: row['ResultAsText'],
        pos: row['Pos'],
        genPos: row['GenPos'],
        catPos: row['CatPos']
    }
});

var raceData = {
    name: `Sx5 King's Park`,
    date: '06/11/2022',
    location: `Glasgow, King's Park`,
    results: []
}
resultData.forEach((runner) => {
    var runnerData = {
        runner: `${runner['forename']} ${runner['surname']}`,
        gender: runner['gender'],
        cat: runner['cat'],
        number: runner['no'],
        position: runner['pos'],
        result: runner['result']
    }
    raceData.results.push(runnerData);
});

// raceData['results'].forEach((runner) => {
//     console.log(runner)
// });

var mongoose=require("mongoose");

var raceSchema = new mongoose.Schema({
    name: String,
    date: String,
    location: String,
    results: [
        {
            runner: String,
            gender: String,
            cat: String,
            number: Number,
            position: Number,
            result: String
        }
    ]
});

// Connecting to database
mongoose.connect("mongodb://localhost/race",{
	useNewUrlParser: true,
	useUnifiedTopology: true
});

var RaceModel = mongoose.model('Race', raceSchema);

console.log(JSON.stringify(raceData, null, 4))

raceData.results.pop();

RaceModel.create(raceData, {runValidators: true}, (error, result) => {
  if (error) {
    console.log(error);
  } else {
    console.log(result);
  }
});
