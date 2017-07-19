/**
 * Created by avishek on 6/7/17.
 */

App.service('ChatService', ['$rootScope', '$timeout', '$http', '$q', '$window', function( $rootScope, $timeout, $http, $q, $window) {
    var ChatService = {};
    var User = {};
    /*User = {
        "123": {
            name: "Mic Folly",
            pic: "./pic.jpg",
            chatDisplay: [{
                "type": "him",
                "text": ["Hello", "How are you mate"],
                "epoch": 1495547489403
            },
                {
                    "type": "him",
                    "text": ["I had seen you."],
                    "epoch": 1495706933847
                },
                {
                    "type": "you",
                    "text": ["Oh really?"],
                    "epoch": 1495709598372
                },
            ],
            sendFirst: true,
            header: {
                "guestId": "1234",
                "type": "you",
                "text": "Oh really?",
                "epoch": 1495709598372
            } //last text
        }
    }*/

    //Socket implementations
    var socket;

    //Opening socket connections
    function open(userId, peerId) {
        if(!userId) {
            return;
        }
        socket = io.connect('', { query : 'userId=' + userId + '&peerId=' + peerId});
        socket.on('connect', function() {
            console.log('SOCKET OPENED');
            socket.on(userId, function(message) {
                $rootScope.$apply(function(){
                    if(message.name) {
                        receiveFirst(message.from, message.to, message.text, message.name, message.pic);
                    }
                    else {
                        receive(message.from, message.text);
                    }
                    makeHeader(message.from, message.text, message.from);
                })
            })

            //populate chat list too
            if(Object.keys(ChatService.User).length === 0) {
                ChatService.makeChatDict();
            }

            if(userId.indexOf('JUVENIK') === -1) {
                $rootScope.isSupport = true;
            }
            else {
                $rootScope.isGuest = true;
            }

        })
    }

    //when user sends or receives
    function makeHeader(from, text, guestId) {
        //this way of identifying if a user is a support or guest is temporary, we should attach flag to rootScope
        var isSupport = $window.localStorage.getItem('token');
        if(isSupport) {
            //User[from].header = {type : from.indexOf('JUVENIK') !== -1 ? 'him' : 'you', text : text, epoch : new Date().getTime()}
            var header =  {
                guestId : guestId,
                type : from.indexOf('JUVENIK') !== -1 ? 'him' : 'you',
                text : text,
                epoch : new Date().getTime()
            }
            User[guestId].header = header;
            User[guestId].updated = true;
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
    function receiveFirst (from, to, text, name, pic) {
        if(!User[from]) {
            var chatDisplay = [];
            User[from] = {
                _id : from,
                name : name,
                pic : pic,
                chatDisplay : chatDisplay,
                sendFirst : false
            }
        }

        receive(from, text);
    }

    //Normal receive
    function receive(from, text) {
        //case when support refreshes the browser but the online guest still pings
        if($rootScope.isSupport && User[from] && User[from].chatDisplay.length === 0 && User[from].header && User[from].header.guestId) {
            getChatDetails(from).then(function(conversation) {
                User[from].chatDisplay = conversation;
                //insertInChatDisplay(from, text, 'him');
            })
        }
        else {
            insertInChatDisplay(from, text, 'him');
        }

    }

    //First time sending message
    function sendFirst(to, text, hisName, hisPic) {
        var _id = to;
        var message = {"type":"you", "text" : [text], "epoch" : Date.now()}
        if(User[_id]) { //first message while replying
            var user = User[_id];
            var chatDisplay = user['chatDisplay'];
            user.sendFirst = false;
            chatDisplay.push(message);
        }
        else { //initiating a chat
            User[to] = {
                _id : to,
                name : hisName,
                pic : hisPic,
                chatDisplay : [
                    message
                ],
                sendFirst : false
            }
        }
        makeHeader($rootScope.user._id, text, to);
        emit({from : $rootScope.user._id, to : to, text : text, name : $rootScope.user.name, pic : $rootScope.user.pic})
    }

    //normal send
    function send(to, text) {
        insertInChatDisplay(to, text, 'you');
        makeHeader($rootScope.user._id, text, to);
        emit({to : to, from : $rootScope.user._id, text : text});
    }

    //inserting into chat display based on messages
    function insertInChatDisplay(id, text, type) {
        var chatDisplay = User[id]['chatDisplay'];
        var now = Date.now();
        var lm = getLastMessage(id,type);
        var lastDate = lm ? lm.epoch : null;
        if(lastDate &&  ( now - lastDate < 5000)) { //instant sending case
            lm.text.push(text);
            lm.epoch = new Date().getTime();
        }
        else {
            chatDisplay.push({type:type, text:[text], epoch:now});
        }
    }

    function getChatDetails(guestId) {
        if(!guestId) return;
        return $http.get('/api/chatDetails?userId=' + $rootScope.user._id + '&guestId=' + guestId).then(function(res) {
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
                    if(current.epoch - last.epoch < 5000) {
                        last.epoch = current.epoch;
                        last.message = last.message + delimitter + current.message;
                        //last.date = current.date;
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

            //$scope.conversation = conversation;
            //ChatService.User[guestId].chatDisplay = conversation;
            return conversation;

        }, function(err) {
            console.log(err);
            return false;
        })
    }

    //fetching last message in a conversation
    function getLastMessage(id, type) {
        var chatDisplay = User[id]["chatDisplay"];
        var lastMessage = chatDisplay[chatDisplay.length-1];
        if(lastMessage && lastMessage.type === type) return lastMessage;
        return null;
    }


    //creating a chat list
    function createChatList (params) {
        var ids;
        var chatList = [];

        if(params === 'all') {
            ids = [];
            for (var key in User) {
                if(User[key].updated) ids.push(key);
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
            var user = User[id];
            var chatDisplay = user.chatDisplay;
            var lastMessage = chatDisplay[chatDisplay.length-1];
            if(lastMessage) {
                var text = lastMessage.text;
                var lastText = text[text.length-1];
                var from = $rootScope.user._id;;
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
    }


    function closeCommunication(chatList, callback) {
        callback();
        /*if(Object.prototype.toString.call( chatList ) === '[object Array]' && chatList.length) {
            $http.post('/api/closecommunication',
                { chatList : chatList},
                { headers : {"x-access-token" : $window.localStorage.getItem('token')}}
                ).then(function() {
                if(callback)
                    callback();
                return true;
            });
        }
        else {
            if(callback)
                callback();
        }*/
    }

    function makeChatDict() {
        var userId = $rootScope.user._id;
        if(!userId) return;
        $http.get('/api/chatList?userId=' + userId).then(function(res) {
            var items = res.data.chatList;
            for(var i=0; i < items.length; i++) {
                var item = items[i];
                var id = item.from;
                if(item.to.indexOf('JUVENIK') !== -1)
                    id = item.to;
                User[id] = {
                    name: "NA",
                    pic: "./pic.jpg",
                    chatDisplay: [],
                    sendFirst: true,
                    updated : false,
                    header : {
                        guestId : id,
                        "type": item.from.indexOf('_JUVENIK') !== -1 ? 'him' : 'you',
                        "text": item.text,
                        "epoch": item.epoch
                    }
                }
            }
        }, function(err) {
            console.log(err);
        });
    }

    //https://gist.github.com/981746/3b6050052ffafef0b4df
    $window.onbeforeunload = function (e) {
        var chatList = createChatList("all");
        //console.log(JSON.stringify(chatList));
        //$window.alert("Saving all the chats");
        //confirm('Hi');
        ChatService.closeCommunication(chatList, function() {

            console.log('HO GAYA');
        });
        //console.log(e);
        //return 'leave this page';
        /*e.preventDefault();
        e.stopImmediatePropagation();*/
    };

    ChatService = {
        User : User,
        receiveFirst : receiveFirst,
        receive : receive,
        sendFirst : sendFirst,
        send : send,
        open : open,
        close : close,
        createChatList : createChatList,
        closeCommunication : closeCommunication,
        makeChatDict : makeChatDict,
        getChatDetails : getChatDetails
    }

    return ChatService;
}])