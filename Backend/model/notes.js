const mongoose = require('mongoose');

const model =  mongoose.Schema({
    title:{
        type:String,
        required:true

    },textarea:{
        type:String,
        required:true

    },date:{
      type: Date,
      default: Date.now
    },pin:{
        type:Boolean,
        default:false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

module.exports = mongoose.model('Notes',model);