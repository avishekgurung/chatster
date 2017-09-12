/**
 * Created by avishek on 6/8/17.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ConnectionSchema = new Schema({
    userId : {
        type : String,
        required : true
    },

    guests : {
        type : Array
    },

    status : {
        type : String
    },

    socketId : {
        type : String
    },

    count : {
        type : Number,
        min:0 //validation does not work on update
    }
});

module.exports = mongoose.model('Connection', ConnectionSchema);