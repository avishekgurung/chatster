/**
 * Created by avishek on 6/3/17.
 */

App.controller('homeCtrl', ['$rootScope', '$location', '$scope', 'Auth', 'ChatService', '$http', '$location', '$anchorScroll','$timeout', function($rootScope, $location, $scope, Auth, ChatService, $http, $location, $anchorScroll, $timeout) {

    console.log('homeCtrl');
    var prevGuestId = null;

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
    $scope.currentGuest;


    var cache = {
        guestId : ''
    };

    $scope.getChatDetails = function(guestId) {
        $scope.guestId = guestId;
        if(prevGuestId) {
            ChatService.Guest[prevGuestId].header.selected = false;
        }
        ChatService.Guest[guestId].header.selected = true;
        prevGuestId = guestId;

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
        $scope.currentGuest = ChatService.Guest[$scope.guestId];
    }

    $scope.change = function (event) {
        if(event.which === 13) {
            var text = $scope.homeCtrl.text;
            $scope.homeCtrl.text = '';
            ChatService.send($scope.guestId, text);

        }
    }


    $scope.$watch(function(){
        return ChatService.Guest;
    }, function() {
        $scope.chatList = [];
        for (var key in ChatService.Guest) {
            $scope.chatList.push(ChatService.Guest[key]['header']);
        }
        if(!$scope.guestId && Object.keys(ChatService.Guest)[0]) {
            $scope.guestId = Object.keys(ChatService.Guest)[0];
            ChatService.Guest[$scope.guestId].header.selected = false;
            $scope.getChatDetails($scope.guestId);
            $scope.currentGuest = ChatService.Guest[$scope.guestId];

        }
        $timeout(function () {
            var obj = document.getElementById('convrplay');
            obj.scrollTop =  obj.scrollHeight + 100;
        },0);
    }, true);

}]);
