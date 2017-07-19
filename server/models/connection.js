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
        type : Number
    }
});

module.exports = mongoose.model('Connection', ConnectionSchema);