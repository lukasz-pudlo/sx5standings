import { createRequire } from "module";
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const mongoose=require("mongoose");

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

// Connecting to database
mongoose.connect("mongodb://localhost/race",{
	useNewUrlParser: true,
	useUnifiedTopology: true
});

var RaceModel = mongoose.model('Race', raceSchema);

const fileNames = ['Kx5.xlsx', 'Lx5.xlsx', 'Rx5.xlsx', 'Px5.xlsx', 'Bx5.xlsx'];

for (const fileName of fileNames) {
    const workbook = XLSX.readFile(`./results/${fileName}`);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const resultData = data.map(row => {
        return {
            forename: row['Forename'],
            surname: row['Surname'],
            gender: row['Gender'],
            cat: row['Cat'],
            pos: row['Pos'],
            genPos: row['GenPos'],
            catPos: row['CatPos'],
            no: row['No.'],
            result: row['ResultAsText'],
        }
    });

    var raceData = {
        name: fileName,
        results: []
    }
    resultData.forEach((runner) => {
        var runnerData = {
            runner: `${runner['forename']} ${runner['surname']}`,
            gender: runner['gender'],
            cat: runner['cat'],
            position: runner['pos'],
            generalPosition: runner['genPos'],
            categoryPosition: runner['catPos'],
            number: runner['no'],
            result: runner['result']
        }
        if(typeof runnerData.position === 'number'){
            raceData.results.push(runnerData);
        }
    });
    console.log(JSON.stringify(raceData, null, 4))

    RaceModel.create(raceData, {runValidators: true}, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            console.log(result);
        }
    });
}