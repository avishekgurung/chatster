/**
 * Created by avishek on 7/19/17.
 */

App.directive('conversation', ['GuestService', '$timeout', function(GuestService, $timeout) {
    return {
        templateUrl : 'guest/views/conversation.html',
        link : function(scope, elements, attributes) {
            scope.conversation = [];
            scope.$watch(function(){
                return GuestService.conversation;
            }, function() {
                scope.conversation = GuestService.conversation;
                $timeout(function () {
                    var obj = document.getElementById('convrplay');
                    obj.scrollTop =  obj.scrollHeight + 100;
                },0);
            }, true);
        }
    }
}])