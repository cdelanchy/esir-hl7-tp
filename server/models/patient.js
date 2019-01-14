const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PatientSchema = new Schema({
  name: String,
  firstname: { type: String, default: '' },
  sex: String,
  surgeryDate: { type: String, default: '' },
  birthDate: { type: String },
  ipp: [String],
  room: {type: String, default: ''},
  service: {type: String, default: ''},
  bed: {type: String, default: ''},
  checkoutDate: { type: String },
  action: { type: String }
});

const Patient = mongoose.model("Patient", PatientSchema);
module.exports = Patient;