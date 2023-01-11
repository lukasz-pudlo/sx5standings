const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
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
