/**
 * Created by avishek on 5/23/17.
 */

App.directive("chatBox", ['GuestService', '$rootScope', function(GuestService) {
    return {
        templateUrl : "guest/views/chatBox.html",
        link : function(scope, elements, attributes) {
            scope.initiate = false;
            scope.instance = {text : '', email: '', emailValid : true};
            scope.text = '';
            scope.agent = null;

            scope.$watch(function() {
                return GuestService.agent;
            }, function() {
                scope.agent = GuestService.agent;
            }, true);

            scope.change = function(event) {
                var keyPressed = event.which;
                if(keyPressed === 13) {
                    var text = scope.instance.text;
                    scope.instance.text = '';
                    if(text) {
                        GuestService.send(text);
                    }
                }
            }

            scope.emailValidate = function(event) {
                if(event.which === 13) {
                    var email = scope.instance.email;
                    scope.instance.email = '';
                    if(Valid.email(email)) {

                        scope.initiate = true;
                        GuestService.initiate();
                    }
                    else {
                        scope.instance.emailValid = false;
                    }
                }
            }

            scope.closeCommunication = function() {
                console.log('CLOSE COMMUNICATION');
                /*var chatDisplay = scope.user.chatDisplay;
                var lastMessage = chatDisplay[chatDisplay.length-1];
                var from = $rootScope.agent._id;
                var to = scope.obj._id;
                var text = lastMessage.text;
                if(lastMessage.type === 'him') {
                    var temp = from;
                    from = to;
                    to = temp;
                }

                ChatService.closeCommunication([{from:from, to:to, text:text[text.length-1]}]);*/
            }
        }
    }
}])