
const mongoose = require('../config/db');

const groupSchema = new mongoose.Schema({
    groupname:{
        type:String,
        required:true,
        minLength:3,
        maxLength:30,
        lowercase:true,

    },
    description:{
        type:String,
    
        minLength:3,
        maxLength:30,
        lowercase:true,
         trim: true 

    },
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

});

const Group = mongoose.model('Group',groupSchema);
module.exports={
    Group
}