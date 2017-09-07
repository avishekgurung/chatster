/**
 * Created by avishek on 6/6/17.
 */
var ChatDetail = require('../models/chat');
var Connection = require('../models/connection');
var ChatList = require('../models/chatList');
var ChatService = {};

var processChat = function(io, message, redis) {

    publish(io, message);

    if(!message.from || !message.to || !message.text) {
        console.warn('Message does not contain valid params');
        return;
    }
    var from = message.from;
    var to = message.to;
    var text = message.text;
    var date = new Date();
    var epoch = date.getTime();
    var guestEmail = message.guestEmail;

    //storing in redis
    var guestId = from.indexOf('JUVENIK') !== -1 ? from : to;
    redis.set(guestId, JSON.stringify({to : to, from : from, text : text, date : date, epoch : epoch, guestEmail : guestEmail}));
    redis.expire(guestId, 60 * 60 * 24);

    //Incrementing the connections of support. Logic: increment connection peers if its a first message
    if(message.name && from.indexOf('JUVENIK') !== -1) {
        Connection.update({userId : to}, {$inc : {count : 1}}, function(err, doc) {
            if(err) {
                console.log('Error in incrementing');
            }
        })
    }

    var chat = new ChatDetail({
        from : from,
        to : to,
        message : text,
        date : date,
        epoch : epoch
    });

    chat.save();
}

function publish(io, message) {
    io.emit(message.to, message);
}

//creates a list of chat
function makeChatList(chatList) {
    for ( var i=0, length = chatList.length;  i < length; i++ ) {
        var item = chatList[i];
        var guestId = item.to.indexOf('JUVENIK') !== -1? item.to : item.from;
        if(item.from && item.to && item.text) {
            var epoch = item.epoch || new Date().getTime();
            var date = new Date(epoch);
            ChatList.findOneAndUpdate({guestId : guestId}, {guestId : guestId, from : item.from, to : item.to, text : item.text, date : date, epoch : epoch, guestEmail : item.guestEmail}, {upsert : true}, function(err, doc) {
                if(err) {
                    console.log('NOT done with Conn updation');
                    console.log(err);
                }
                else {
                    console.log('DONE with Conn updation')
                }
            })
        }
    }
}

//should give the partner name, pic, _id along with a single line of latest message
function getChatList(userId, res) {
    //var query = Chat.find({$or : [ { from : userId }, { to : userId}]}).sort({ date : -1 });
    var query = ChatList.find({$or: [{ from: userId }, { to: userId }]}).sort({ date : -1}).limit(10);
    query.exec(function(err, chatList) {
        if(err) {
            res.status(500).json({message: 'Error in internal query'});
        }
        else {
            res.json({ success : true, chatList : chatList});
        }
    })
}


function getChatDetails(userId, guestId, res) {
    var query = ChatDetail.find({
        $or: [
            {
                $and: [{ from: userId }, { to: guestId}]
            },
            {
                $and: [{ from: guestId }, { to: userId }]
            }
        ]
    });
    query.exec(function(err, chats) {
        if(err) {
            res.status(500).json({ success : false, message : 'Error in querying chat details'});
        }
        else {
            res.json({success : true, chats : chats});
        }
    })
}


ChatService.processChat = processChat;
ChatService.getChatList = getChatList;
ChatService.getChatDetails = getChatDetails;
ChatService.makeChatList = makeChatList;

module.exports = ChatService;
