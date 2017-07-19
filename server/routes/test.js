/**
 * Created by avishek on 5/31/17.
 */

var express = require('express');
var test = express.Router();



test.get('/', function(req, res, next) {
    console.log('First method');
    res.status(403).json({'message' : 'Helow'});
    //res.send('Go away');
    //next();
})

test.use(function(req, res) {
    console.log('Second method');
    res.send('wait');
})

module.exports = test;
