const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
const Patient = require("../models/patient");
const iconv = require('iconv-lite');
var multer = require('multer');
var upload = multer();
const Message = require('../models/message');

const app = express()

app.use(cors())


// Fetch all posts
app.get('/patients', (req, res) => {
  Patient.find({}, 'firstname sex name service room bed surgeryDate birthDate ipp checkoutDate action' ,function (error, patients) {
    if (error) { console.error(error); }
    res.send({
      patients: patients
    })
  }).sort({_id:-1})
})

app.post('/single-file', upload.single('file'), (req, res) => {
  const file = req.file

  let msg = iconv.decode(file.buffer, 'utf8')

  let message = new Message(msg)
  //let patientInfo = treatMsg(message)
  //const new_patient = new Patient(patientInfo)

  // new_patient.save(function (error) {
  //   if (error) {
  //     console.log(error)
  //   }
  //   res.send({
  //     success: true,
  //     message: 'Patient saved successfully!'
  //   })
  // })

  let patientInfo = message.getPatientFromMessage()
  let type = message.getType()
  switch (type) {
    case 'ADT^A01' : 
      console.log('dats it A01')
      Patient.findOne({ipp: patientInfo.ipp}, (err, patient) => { 
        if (patient) {
          res.send({
            success: false,
            type: 'warn',
            message: 'Patient already exists!'
          })      
        } else {
          patientInfo.action = 'insert'
          patientInfo.surgeryDate = patientInfo.eventDate
          let new_patient = new Patient(patientInfo)
          new_patient.save((err) => {
            if (err) {
              console.log(err)
            }
            res.send({
              success: true,
              type: 'success',
              message: 'Le patient a été admis avec succès !'
            })
          })
        }
      })
      
      break
    case 'ADT^A02' :
      console.log('dats it A02')
      Patient.findOne({ipp: patientInfo.ipp}, (err, patient) => {
        if (patient && !patient.checkoutDate) {
          patientInfo.action = 'transfert'
          patient.update(patientInfo, (err) => {
            if (err) {
              console.log(err)
            }
            res.send({
              success: true,
              type: 'success',
              message: 'Le patient a été transféré avec succès !'
            })
          })
        } else if (patient && patient.checkoutDate) {
          res.send({
            success: false,
            type: 'warn',
            message: 'Le patient est déjà sorti !'
          })
        } else {
          res.send({
            success: false,
            type: 'warn',
            message: 'Le patient n\'a pas effectué son admission'
          })       
        }

      })
      
      break
    case 'ADT^A03' : 
      console.log('dats it A03')
      Patient.findOne({ipp: patientInfo.ipp}, (err, patient) => {
        if (patient) {
          patientInfo.action = 'checkout'
          patientInfo.checkoutDate = patientInfo.eventDate
          patient.update(patientInfo, (err) => {
            if (err) {
              console.log(err)
            }
            res.send({
              success: true,
              type: 'success',
              message: 'Le patient est sorti avec succès !'
            })
          })
        } else {
          res.send({
            success: false,
            type: 'warn',
            message: 'Le patient n\'a pas effectué son admission'
          })
        }

      })
      break
    default : 
      console.log('dunno lol', type)
      res.send({
        success: false,
        type: 'error',
        message: 'Il doit y avoir une petite erreur...'
      })
      break
  }
})

const treatMsg = (message) => {
  let patientInfo = message.getPatientFromMessage()
  let type = message.getType()
  switch (type) {
    case 'ADT^A01' : 
      console.log('dats it A01')
      patientInfo.action = 'insert'
      let new_patient = NewPatient(patientInfo)
      new_patient.save((err) => {
        if (err) {
          console.log(err)
        }
      })
      break
    case 'ADT^A02' :
      console.log('dats it A02')
      Patient.findOne({ipp: patientInfo.ipp}, (err, patient) => {
        console.log(patient)
        patientInfo.action = 'transfert'
        patient.update(patientInfo, (err) => {
          if (err) {
            console.log(err)
          }
        })
      })
      
      break
    case 'ADT^A03' : 
      console.log('dats it A03')
      Patient.findOne({ipp: patientInfo.ipp}, (err, patient) => {
        console.log(patient)
        patientInfo.action = 'checkout'
        patient.update(patientInfo, (err) => {
          if (err) {
            console.log(err)
          }
        })
      })
      break
    default : 
      console.log('dunno lol', type)
      break
  }
  return patientInfo;
}

app.post('/patients', (req, res) => {
  const db = req.db
  const firstname = req.param('firstname')
  const sexe = req.param('sexe')
  const name = req.param('name')

  const new_patient = new Patient({
    firstname: firstname,
    sexe: sexe,
    name: name
  })

  new_patient.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Patient saved successfully!'
    })
  })
})

app.get('/patients/delete', (req, res) => {
  var db = req.db;
  const pwd = req.param('pwd')
  console.log('okaay', pwd)
  if (pwd === 'yolo') {
    Patient.remove({}, function(err){
      if (err)
        res.send(err)
      res.send({
        success: true
      })
    })
  }

})

app.listen(process.env.PORT || 8081)


mongoose.connect('mongodb://127.0.0.1:27017/patients', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function(callback){
  console.log('Connection Succeeded');
});
