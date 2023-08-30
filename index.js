const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Doctor = require("./models/doctor");
const Appointment = require("./models/appointment");
const multer = require('multer');
const bcrypt = require('bcrypt');



const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
mongoose.connect(process.env.DATA_BASE);

app.post("/auth/register", async (req, res) => {
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newDoctor = await new Doctor({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
    }).save();
    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      email: req.body.email,
    });
    const passwordMatch = await bcrypt.compare(req.body.password, doctor.password);
    if (doctor && passwordMatch) {
      doctor.password = undefined;
     return res.status(200).json(doctor);
    }
    res.status(404).json({message: 'Invalid Credentials'});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/addAppointments/:doctorId", async (req, res) => {
  try {
    const date = await Appointment.findOne({ date: req.body.date });

    if (!date) {
      for (var i = req.body.start; i <= req.body.end; i++) {
        const appointment = await new Appointment({
          date: req.body.date,
          time: i,
          doctorId: req.params.doctorId,
        }).save();
      }
      res.status(201).json({ message: "Success" });
    } else {
      res.status(400).json({ message: "This Date Already Has Times" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/availbleAppointments/:doctorId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.params.doctorId,
      date: req.body.date,
      isAvailable: true,
    });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/reserveAppointment/:doctorId", async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      doctorId: req.params.doctorId,
      date: req.body.date,
      isAvailable: true,
      time: req.body.time,
    });
    if (
      appointment &&
      req.body.patientName &&
      req.body.patientPhoneNumber &&
      req.body.patientEmail
    ) {
      appointment.patientName = await req.body.patientName;
      appointment.patientPhoneNumber = await req.body.patientPhoneNumber;
      appointment.patientEmail = await req.body.patientEmail;
      appointment.isAvailable = false;
      await appointment.save();
      res.status(200).json(appointment);
    } else {
      res.status(500).json({ message: "appointment not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/reservedAppointments/:doctorId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.params.doctorId,
      isAvailable: false,
    });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/cancelAppointment/:doctorId", async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      doctorId: req.params.doctorId,
      date: req.body.date,
      isAvailable: false,
      time: req.body.time,
    });
    if(appointment){
      appointment.isAvailable=true;
      appointment.patientName=undefined;
      appointment.patientPhoneNumber=undefined;
      appointment.patientEmail=undefined;
      await appointment.save();
      res.status(200).json({ message:"success"})
    }else {
      res.status(404).json({ message:"appts not found"})
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const storage= multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'uploads/')
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now() + '-' + file.originalname)
  }
})

const upload= multer({storage:storage})

app.post('/uploadDoctorImage/:doctorId', upload.single('image'),async (req, res) => {
  const doctor= await Doctor.findById({_id:req.params.doctorId})
  
  if (!req.file&&!doctor) {
    return res.status(400).send('No file uploaded.');
  }
  doctor.imagePath = req.file.path
  await doctor.save();
  res.send('File uploaded successfully.');
});




app.listen(3001, () => {
  console.log("listening on port 3001");
});
