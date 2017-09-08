/**
 * Created by avishek on 6/7/17.
 */

App.service('ChatService', ['$rootScope', '$http','$timeout', function( $rootScope, $http, $timeout) {
    var ChatService = {};
    var Guest = {};

    //Socket implementations
    var socket;

    //Opening socket connections
    function open(agentId) {
        if(!agentId) {
            return;
        }
        socket = io.connect('', { query : 'userId=' + agentId });
        socket.on('connect', function() {
            console.log('SOCKET OPENED');
            socket.on(agentId, function(message) {
                $rootScope.$apply(function(){
                    var selected = false;
                    if(message.name) {
                        receiveFirst(message.from, message.to, message.text, message.name, message.pic, message.guestEmail);
                        //selected = true;
                    }
                    else {
                        receive(message.from, message.text);
                    }
                    makeHeader(message.from, message.text, message.from, selected);
                })
            })

            //populate chat list too
            if(Object.keys(ChatService.Guest).length === 0) {
                ChatService.makeChatDict();
            }
        })
    }

    //when user sends or receives
    function makeHeader(from, text, guestId, selected) {
        var isSupport = !!$rootScope.agent;
        if(isSupport) {
            var unread = false;
            if($rootScope.currentGuest.header.guestId !== guestId && from.indexOf('JUVENIK') !== -1) {
                unread = true;
            }

            if($rootScope.currentGuest.header.guestId === guestId) {
                selected = true;
            }

            var header =  {
                guestId : guestId,
                type : from.indexOf('JUVENIK') !== -1 ? 'him' : 'you',
                text : text,
                epoch : new Date().getTime(),
                selected: selected,
                guestEmail : Guest[guestId].guestEmail,
                unread : unread
            }
            Guest[guestId].header = header;
            Guest[guestId].updated = true;
        }
    }

    //closing the socket
    function close () {
        socket.close();
        console.log('SOCKET CLOSED');
    }

    //emitting the message
    function emit(message) {
        socket.emit("CHAT", message);
    }


    //First time receiving a message
    function receiveFirst (from, to, text, name, pic, guestEmail) {
        if(!Guest[from]) {
            var conversation = [];
            Guest[from] = {
                _id : from,
                name : name,
                pic : pic,
                conversation : conversation,
                sendFirst : false,
                guestEmail: guestEmail
            }
        }

        receive(from, text);
    }

    //Normal receive
    function receive(from, text) {
        //case when support refreshes the browser but the online guest still pings
        if(Guest[from] && Guest[from].conversation.length === 0 && Guest[from].header && Guest[from].header.guestId) {
            getChatDetails(from).then(function(items) {
                Guest[from].conversation = items;
            })
        }
        else {
            var conversation = Guest[from]['conversation'];
            Utility.addConversation(conversation, text, 'him');
        }
    }

    //normal send
    function send(to, text) {
        var conversation = Guest[to]['conversation'];
        Utility.addConversation(conversation, text, 'you');
        makeHeader($rootScope.agent._id, text, to, true);
        emit({to : to, from : $rootScope.agent._id, text : text});
    }


    function getChatDetails(guestId) {
        if(!guestId) return;
        return $http.get('/api/chatDetails?userId=' + $rootScope.agent._id + '&guestId=' + guestId).then(function(res) {
            var arr = res.data.chats;
            var result = [];
            var index = 0;
            var delimitter = "Xcatbp8q4m";
            var last = arr[0];
            last.type = arr[0].from.indexOf('JUVENIK') !== -1 ? 'him' : 'you';

            for (var i=1; i < arr.length; i++) {
                result[index] = last;
                var current = arr[i];
                current.type = current.from.indexOf('JUVENIK') !== -1 ? 'him' : 'you';
                if(last.type === current.type) {
                    if(current.epoch - last.epoch < 30000) {
                        last.epoch = current.epoch;
                        last.message = last.message + delimitter + current.message;
                    }
                    else {
                        last = current;
                        index++;
                        if(i == arr.length-1) {
                            result[index] = current;
                        }
                    }
                }
                else {
                    last = current;
                    index++;
                    if(i == arr.length-1) {
                        index++;
                        result[index] = current;
                    }
                }
            }


            if(!result.length) {
                result.push(last);
            }
            var conversation = [];
            for (var i=0; i < result.length; i++) {
                if (result[i]) {
                    var obj = {
                        type: result[i].type,
                        text: result[i].message.split(delimitter),
                        epoch: result[i].epoch
                    }
                    conversation.push(obj);
                }
            }

            return conversation;

        }, function(err) {
            console.log(err);
            return false;
        })
    }


    //creating a chat list
/*    function createChatList (params) {
        var ids;
        var chatList = [];

        if(params === 'all') {
            ids = [];
            for (var key in Guest) {
                if(Guest[key].updated) ids.push(key);
            }
        }
        else if(params.constructor().toLowerCase().indexOf('array') !== -1) {
            ids = params;
        }
        else {
            ids = [params];
        }

        for ( var i=0; i < ids.length; i++ ) {
            var id = ids[i];
            var guest = Guest[id];
            var conversation = guest.conversation;
            var lastMessage = conversation[conversation.length-1];
            if(lastMessage) {
                var text = lastMessage.text;
                var lastText = text[text.length-1];
                var from = $rootScope.agent._id;;
                var to = id;
                if(lastMessage.type === 'him') {
                    var temp = to;
                    to = from;
                    from = temp;
                }
                chatList.push({from : from, to : to, text : lastText , epoch : lastMessage.epoch});
            }
        }
        return chatList;
    }*/

    function makeChatDict() {
        var agentId = $rootScope.agent._id;
        if(!agentId) return;
        $http.get('/api/chatList?userId=' + agentId).then(function(res) {
            var items = res.data.chatList;
            for(var i=0; i < items.length; i++) {
                var item = items[i];
                var id = item.from;
                var selected = false;
                //if(i === 0) selected = true;
                if(item.to.indexOf('JUVENIK') !== -1) {
                    id = item.to;
                }
                Guest[id] = {
                    name: "NA",
                    pic: "./pic.jpg",
                    conversation: [],
                    updated : false,
                    guestEmail : item.guestEmail,
                    header : {
                        guestId : id,
                        "type": item.from.indexOf('_JUVENIK') !== -1 ? 'him' : 'you',
                        "text": item.text,
                        "epoch": item.epoch,
                        selected : selected,
                        guestEmail : item.guestEmail,
                        unread : false
                    }
                }
            }
        }, function(err) {
            console.log(err);
        });
    }

    ChatService = {
        Guest : Guest,
        receiveFirst : receiveFirst,
        receive : receive,
        send : send,
        open : open,
        close : close,
        //createChatList : createChatList,
        makeChatDict : makeChatDict,
        getChatDetails : getChatDetails
    }

    return ChatService;
}])

/*
    Structure of
    ChatService.Guest =
 */

