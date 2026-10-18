const mongoose = require('mongoose');

const Task =  mongoose.Schema({
    task:{
        type:String,
        required:true,
    },
    label:{
        type:String,
        required:true
    },

    status:{
        type:String,
        required:true
    },
    priority:{
        type:String,
        required:true,
    },
     startDate: {
        type: Date,
       
    },
     dueDate: {
        type: Date,
        default: Date.now
    }, 
    completed: {
        type: Date,
        default: null
    }, 
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

module.exports = mongoose.model('task',Task);