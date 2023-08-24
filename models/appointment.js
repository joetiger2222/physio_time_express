const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  patientName:String,
  patientPhoneNumber:String,
  patientEmail:String,
});
module.exports= mongoose.model('Appointment', appointmentSchema)
