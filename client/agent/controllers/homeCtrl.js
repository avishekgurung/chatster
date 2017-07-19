/**
 * Created by avishek on 6/3/17.
 */

App.controller('homeCtrl', ['$rootScope', '$location', '$scope', 'Auth', 'ChatService', '$http', function($rootScope, $location, $scope, Auth, ChatService, $http) {

    console.log('homeCtrl');

    $scope.logout = function() {
        Auth.logout();
        $location.path('/agent/login');
    }

    $scope.homeCtrl = {
        text : ''
    }
    $scope.chatBoxList = {};
    $scope.chatList = [];
    $scope.conversation = null;
    $scope.guestId = '';
    var cache = {
        guestId : '',
        chatBoxList : true
    };

    $scope.$watch('ChatService.User', function() {
        $scope.chatBoxList= ChatService.User;
    }, true);


    /*$scope.$watch(function() {
        return $rootScope.user;
    }, function() {
        $scope.getChatList($rootScope.user._id, 1);

    })*/

    $scope.getChatDetails = function(guestId) {
        $scope.guestId = guestId;
        if(ChatService.User[guestId].chatDisplay.length !==0 ) {
            $scope.conversation = ChatService.User[guestId].chatDisplay;
        }
        else {
            if(cache.guestId === guestId) return;
            cache.guestId = guestId;
            ChatService.getChatDetails(guestId).then(function (conversation) {
                $scope.conversation = conversation;
                ChatService.User[guestId].chatDisplay = conversation;
            })

/*            $http.get('/api/chatDetails?userId=' + $rootScope.user._id + '&guestId=' + guestId).then(function(res) {
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
                            last.date = current.date;
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
                            date: result[i].date
                        }
                        conversation.push(obj);
                    }
                }

                $scope.conversation = conversation;
                ChatService.User[guestId].chatDisplay = conversation;

            }, function(err) {
                console.log(err);
            })*/

        }


        $scope.change = function (event) {
            if(event.which === 13) {
                var text = $scope.homeCtrl.text;
                $scope.homeCtrl.text = '';
                if(ChatService.User[$scope.guestId].sendFirst) {
                    ChatService.sendFirst($scope.guestId, text);
                }
                else {
                    ChatService.send($scope.guestId, text);
                }
            }
        }

    }

    /*$scope.getChatList = function(userId, offset) {
        if(Object.keys(ChatService.User).length === 0) {
            ChatService.makeChatDict();
        }
    }*/

    $scope.$watch(function(){
        return ChatService.User;
    }, function() {
        $scope.chatList = [];
        for (var key in ChatService.User) {
            $scope.chatList.push(ChatService.User[key]['header']);
        }
    }, true);

}]);
