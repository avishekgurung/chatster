/**
 * Created by avishek on 5/29/17.
 */

var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');
var redis = require('redis').createClient();

var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http);
var ChatService = require('./services/chatService');

var __appDir = (function(){
    var arr = __dirname.split('/');
    arr.pop();
    return arr.join('/');
})();


//redis connection
redis.on('connect', function() {
    console.log('Redis connected');
})


var Connection = require('./models/connection');

mongoose.connect(config.database, function(err) {
    if(err) {
        console.log('Error on database connection');
        console.log(err);
    }
    else {
        console.log('Database connected : ' + config.database);
    }
});

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
//app.use(morgan('dev'));


app.use(express.static(__appDir + '/client')); //in the UI, all directories mapping will start from client folder
app.use('/scripts', express.static(__dirname + '/node_modules/socket.io/lib/')); //to fetch npm modules in UI

var api = require('./routes/api');
app.use('/api', api);

var test = require('./routes/test');
app.use('/test', test);

app.get('/guest', function (req, res) {
    res.sendFile((__appDir + '/client/guest/guest.html'));
})

app.get('*', function(req, res) {
    res.sendFile(__appDir + '/client/agent/agent.html');
});

io.on('connection', function(socket) {
    console.log('Connection established with ');
    var userId = socket.handshake.query['userId'];
    var peerId = socket.handshake.query['peerId'];
    var socketId = socket.id;
    console.log('Connection established with ' + userId + ' with peer ' + peerId);
    socket.userId = userId;
    socket.peerId = peerId;
    //console.log(socket.handshake.query['userId']);

    socket.on('CHAT', function(message) {
        if(message.guestEmail) {
            io.guestEmail = message.guestEmail;
        }
        else {
            message.guestEmail = io.guestEmail;
        }
        ChatService.processChat(io, message, redis);
    })

    socket.on('disconnect', function() {
        console.log('Disconnected with ' + socketId);
        if(socket.userId.indexOf('JUVENIK') !== -1) { //guest disconnect
            Connection.update({userId : peerId}, { $inc : {count : -1}}, function(err, doc) {});
            var guestId = socket.userId;
            redis.get(guestId, function(err, message) {
                if(!err && message) {
                    message = JSON.parse(message);
                    ChatService.makeChatList([message]);
                    redis.del(guestId);
                }
            })
        }
        else { //support disconnect

            //when support refreshes or logs out, we update the chat list
            Connection.findOne({userId : socket.userId}, function(err, connection) {
                if(connection) {
                    var guests = connection.guests;
                    for (var i=0; i < guests.length; i++) {
                        var guestId = guests[i];
                        redis.get(guestId, function(err, message) {
                            if(!err) {
                                message = JSON.parse(message);
                                if(message) {
                                    ChatService.makeChatList([message]);
                                    redis.del(guestId);
                                }
                            }
                        })
                    }
                }
            })


            setTimeout(function(){
                Connection.findOne({socketId : socketId}, function(err, connection) {
                    if(connection) { //means Customer Support has logged out or closed the window but not just refreshed the browser
                        Connection.update({socketId : socketId}, {$set : {status : 'offline', count : 0, guests : []}}, function(err, doc) {});
                    }
                })
            }, 5000);
        }

    })

    //Making support ONLINE : only when the connection is established by support
    if(userId.indexOf('JUVENIK') === -1) {
        Connection.update({userId: userId}, {$set: {status: 'online', socketId: socket.id}}, function (err) {
            if (err) {
                console.log('Updation failed');
                console.log(err);
            }
        });
    }

});



http.listen(config.port, function(err) {
    if(!err) {
        console.log('Server running @ ' + config.port, __dirname);
    }
    else {
        console.log('Error in running server');
        console.log(err);
    }
})


