'use strict'

const mongoose = require('mongoose');
let Schema = mongoose.Schema;

//create a Schema
let workerSchema = new Schema({
  name: String,
  workerid: {type: String, required: true, unique: true},
  minutesWork: Number,
  phone: String
});

//the schema is useless so far
//we need to create a model using it
let Worker = mongoose.model('Worker', workerSchema);

//make this available to our users in our Node Applications
module.exports = Worker;
