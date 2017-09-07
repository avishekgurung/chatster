/**
 * Created by avishek on 6/17/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatListSchema = new Schema({
    guestId : {
        type : String,
        required : true
    },

    from : {
        type : String,
        required : true
    },

    to : {
        type : String,
        required : true,
    },

    text : {
        type : String,
        required : true
    },

    date : {
        type : Date
    },

    epoch : {
        type : Number,
        required : true
    },

    guestEmail : {
        type : String,
        required : true
    }

})

module.exports = mongoose.model('ChatList', ChatListSchema);