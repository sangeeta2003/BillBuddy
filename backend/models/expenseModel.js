
const mongoose = require('../config/db');

const expenseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minLength:3,
        maxLength:30,
        lowercase:true,
    },

    amount:{
        type:Number,
        required:true,
    },

    paidBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },

    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
                        ref:'User'
        }
    ],
splitType:{
    type:String,
    enum:['equal','unequal','percentage'],
    default:'equal',
    required:true
},
splitDetails:[{
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
},
amount:{
    type:Number,
    required:true
},
percentage:{
    type:Number,
    default:0
},
status:{
    type:String,
    enum:['paid','unpaid'],
    default:'unpaid'
}
}],
createdAt:{
        type:Date,
        default:Date.now
    }


});


const Expense = mongoose.model('Expense',expenseSchema);

module.exports={
    Expense
}