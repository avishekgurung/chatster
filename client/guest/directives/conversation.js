/**
 * Created by avishek on 7/19/17.
 */

App.directive('conversation', ['GuestService', function(GuestService) {
    return {
        templateUrl : 'guest/views/conversation.html',
        link : function(scope, elements, attributes) {
            scope.conversation = [];
            scope.$watch(function(){
                return GuestService.conversation;
            }, function() {
                scope.conversation = GuestService.conversation;
            }, true);
        }
    }
}])