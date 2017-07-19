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

    $scope.chatList = [];
    $scope.conversation = null;
    $scope.guestId = '';
    var cache = {
        guestId : ''
    };

    $scope.getChatDetails = function(guestId) {
        $scope.guestId = guestId;
        if(ChatService.Guest[guestId].conversation.length !==0 ) {
            $scope.conversation = ChatService.Guest[guestId].conversation;
        }
        else {
            if(cache.guestId === guestId) return;
            cache.guestId = guestId;
            ChatService.getChatDetails(guestId).then(function (conversation) {
                $scope.conversation = conversation;
                ChatService.Guest[guestId].conversation = conversation;
            })
        }


        $scope.change = function (event) {
            if(event.which === 13) {
                var text = $scope.homeCtrl.text;
                $scope.homeCtrl.text = '';
                ChatService.send($scope.guestId, text);
            }
        }

    }


    $scope.$watch(function(){
        return ChatService.Guest;
    }, function() {
        $scope.chatList = [];
        for (var key in ChatService.Guest) {
            $scope.chatList.push(ChatService.Guest[key]['header']);
        }
    }, true);

}]);
