/**
 * Created by avishek on 5/29/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
require('mongoose-type-email');

var UserSchema = new Schema({
    name : String,

    email : {
        type : mongoose.SchemaTypes.Email,
        required : true,
        index : {
            unique : true
        }
    },

    password : {
        type : String,
        required : true,
        select : false //so that when we use select query, we do not get password
    },

    role : {
        type : String
    },

    online : {
        type : Boolean
    }
});

//Hook before saving
UserSchema.pre('save', function(next) {
    var user = this;
    if(!user.isModified('password')) return next();
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if(err) return next(err);
        user.password = hash;
        next();
    })
})

//custom methods to use it when comparing password. Always available with user instance.
UserSchema.methods.comparePassword = function(password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('User', UserSchema);

