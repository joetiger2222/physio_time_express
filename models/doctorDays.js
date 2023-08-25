const mongoose = require("mongoose");

const doctorDaysSchema=mongoose.Schema({
    date:{
        type:String,
        required:true,
    },
    start:{
        type:String,
        required:true,
    },
    end:{
        type: String,
        require:true
    },
    doctorId:{
        type:String,
        required:true,
    }
})

module.exports = mongoose.model('DoctorDays',doctorDaysSchema)