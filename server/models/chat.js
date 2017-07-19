/**
 * Created by avishek on 6/6/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    from : {
        type : String,
        required : true
    },
    to : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    message : {
        type : String,
        required : true
    },
    epoch : {
        type : Number,
        required : true
    }
})

ChatSchema.methods.add = function(from, to, date, text) {
    if(!from || !to || !date || !text) {
        console.log('Incomplete data');
        return;
    }
    var chat = this;

}

module.exports = mongoose.model('Chat', ChatSchema);