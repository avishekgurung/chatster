/**
 * Created by avishek on 5/29/17.
 */

var User = require('../models/user');
var Connection = require('../models/connection');
var config = require('../config');
var secretKey = config.secretKey;
var express = require('express');
var jsonwebtoken = require('jsonwebtoken');
var _ = require('underscore');
var ChatService = require('../services/chatService');
var Valid = require('../../client/common/validator');

function createToken(user) {
    var token = jsonwebtoken.sign({
        _id: user._id,
        name: user.name,
        email: user.email
    }, secretKey, {
        expiresIn: 3600//in seconds
    });
    return token;
}

function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

var api = express.Router();

api.get('/test', function(req, res) {
    res.json({success : true});
})

//a list of chats
api.get('/chatList', function(req, res) {
    var userId = req.body.userId || req.param('userId');
    ChatService.getChatList(userId, res);
})

//details of converstation
api.get('/chatDetails', function(req, res) {
    var userId = req.body.userId || req.param('userId');
    var guestId = req.body.guestId || req.param('guestId');
    ChatService.getChatDetails(userId, guestId, res);
})

//guest activation
api.get('/guestActivation', function(req, res) {
    Valid.sleep(1);
    User.find({}, function(err, users){ //the selection query should be based on a company
        if(err) {
            res.status(500).json({message : 'Guest Activation : Finding company users.'})
        }
        else {
            /*var userIds = _.map(users, function(user) {
                return user._id.toString();
            });*/
            var userIds = [];
            var userDict = {};

            for (var i=0, length=users.length; i < length; i++) {
                var user = users[i];
                var userId = user._id.toString();
                userIds.push(userId);
                userDict[userId] = user;
            }

            Connection.find({userId : {$in : userIds}, status : 'online'}, function(err, connections) {
                if(err) {
                    res.status(500).json({message : 'Guest Activation : Finding company connections.'})
                }
                else if(connections.length === 0 ) {
                    res.json({success : false, message : 'No support executives are online at the moement', user : null})
                }
                else {
                    var selectedConnection, minPeers = 10000;
                    for (var i=0; i < connections.length; i++) {
                        var connection = connections[i];
                        if(connection.count < minPeers) {
                            minPeers = connection.count;
                            selectedConnection = connection;
                        }
                    }

                    var userWithMinConnection = userDict[selectedConnection.userId];
                    var guestId = randomString(10) + new Date().getTime() + randomString(10) + '_JUVENIK';
                    var guest = {
                        _id :  guestId,
                        name : "Guest " + (selectedConnection.count+1),
                        pic : "/guest.jpg"
                    };

                    Connection.findOneAndUpdate({userId : selectedConnection.userId}, { $push : {guests : guestId}}, function(err, doc) {
                        if(err) {
                            console.log(err);
                        }
                        else {
                            res.json({success : true, message : 'You are now connected to ' + userWithMinConnection.name, agent : userWithMinConnection, guest : guest});
                        }
                    });
                }
            })


        }
    })
})

//User signing up
api.post('/signup', function(req, res) {
    var user = new User({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        role : 'worker',
        pic : "/no_pic.jpg"
    });

    var token = createToken(user);
    user.save(function(err, data) {
        if(err) {
            var message = 'Not able to register';
            if(err.errmsg && err.errmsg.indexOf('duplicate key err') !== -1) {
                message = 'The email is already registered';
            }
            else if(err.errors && err.errors.email) {
                message = 'Invalid email address';
            }
            res.status(403).json({message : message});
        }
        else {
            var connection = new Connection({
                userId : data.id,
                status : 'offline',
                socketId : '',
                count : 0
            })
            connection.save();
            res.status(201).json({"message" : "Account created successfully"});
        }
    })
});

api.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        if(err) {
            res.send(err);
            return;
        }
        res.json(users);
    });
});

//User loggin into the app
api.post('/login', function(req, res) {
    User.findOne({email : req.body.email}, 'name email password', function(err, user) {
        if(err) {
            throw err;
        }
        if(!user) {
            res.status(403).send({'message' : 'User does not exists'});
            return;
        }
        var validPassword = user.comparePassword(req.body.password);
        if(!validPassword) {
            res.status(403).send({'message' : 'Wrong password'});
            return;
        }
        var token = createToken(user);
        var obj = { _id : user._id, name : user.name, email : user.email};
        res.json({
            success : true,
            message : 'Successful login',
            token : token,
            user : obj
        })
    })
})

/*
 maintaining the session for the user. So all the request coming to api will land here, except the above request since they
 do not use next() so it will not land here. Except that, all other request will come here. So this is a gateway for all the
 request.
 */
api.use(function(req, res, next) {
    console.log('Somebody just came into our app');
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];
    if(token) {
        jsonwebtoken.verify(token, secretKey, function (err, decoded) {
            if(err) {
                res.status(403).send({success : false, message : 'Failed to authenticate user'});
            }
            else {
                req.decoded = decoded;
                next();
            }
        })
    }
    else {
        console.log('No token provided');
        res.status(403).send({success : false, message : 'No token provided'});
    }
})

api.get('/', function(req, res) {
    res.json("Logged in as " + req.decoded);
})

api.get('/me', function (req, res) {
    var obj = {
        _id : req.decoded._id,
        name : req.decoded.name,
        email : req.decoded.email
    }
    res.json({user : obj});
})

//when Support closes the communication
api.post('/closecommunication', function(req, res) {
    var chatList = req.body.chatList;
    ChatService.makeChatList(chatList);
    res.json({success : true});
})





module.exports = api;