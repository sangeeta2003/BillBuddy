
const mongoose = require('../config/db');



const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3,
        maxLength:30,
        lowercase:true
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
        minLength:3,
        maxLength:30,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    }
});

const User = mongoose.model('User',userSchema);
module.exports={
    User
}

