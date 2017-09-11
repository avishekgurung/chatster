/**
 * Created by avishek on 6/10/17.
 */

App.factory('GuestService', ['$http', '$rootScope', function($http, $rootScope) {
    var GuestService = {
        guest : null,
        agent : null,
        status : null,
        conversation : []
    }

    var socket;

    //Opening socket connections
    function open(guestId, agentId) {
        socket = io.connect('', { query : 'userId=' + guestId + '&peerId=' + agentId});
        socket.on('connect', function() {
            console.log('SOCKET OPENED');
            socket.on(guestId, function(message) {
                $rootScope.$apply(function(){
                    Valid.playChatSound();
                    $rootScope.unread = true;
                    GuestService.conversation = Utility.addConversation(GuestService.conversation, message.text, 'him');
                })
            })
        })
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

    //initiating chat conversation
    function initiate(email) {
        $http.post('/api/guestActivation', {email : email}).then(function(response) {
            if (response.data.success) {
                GuestService.agent = response.data.agent;
                GuestService.guest = response.data.guest;
                GuestService.conversation = [{
                    "type": "you",
                    "text": ["Initiation of conversation"],
                    "epoch": new Date().getTime()
                }];
                GuestService.status = response.data.message;

                open(GuestService.guest._id, GuestService.agent._id);
                emit({
                    from: GuestService.guest._id,
                    to: GuestService.agent._id,
                    text: 'Initiation of conversation',
                    name: GuestService.agent.name,
                    pic: GuestService.agent.pic,
                    guestEmail: GuestService.guest.email
                });
            }
            else {
                GuestService.agent = undefined;
            }

        }, function(){

        });
    }

    //sending message to agent
    function send(text) {
        GuestService.conversation = Utility.addConversation(GuestService.conversation, text, 'you');
        emit({from : GuestService.guest._id, to : GuestService.agent._id, text : text, guestEmail:GuestService.guest.email});
    }

    GuestService.initiate = initiate;
    GuestService.send = send;
    GuestService.close = close;
    return GuestService;
}])