/**
 * Created by avishek on 5/23/17.
 */

App.directive("chatBox", ['GuestService', '$rootScope', function(GuestService, $rootScope) {
    return {
        templateUrl : "guest/views/chatBox.html",
        link : function(scope, elements, attributes) {
            scope.initiate = false;
            scope.serverReponse = 0;
            scope.instance = {text : '', email: '', emailValid : true};
            scope.text = '';
            scope.agent = null;
            scope.showAlert = false;

            scope.$watch(function() {
                return GuestService.agent;
            }, function() {
                scope.serverReponse = GuestService.agent ? 1 : 2;
                scope.agent = GuestService.agent;
            }, true);

            scope.change = function(event) {
                $rootScope.unread = false;
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
                        scope.serverReponse = 0;
                        scope.initiate = true;
                        GuestService.initiate(email.toLowerCase());
                    }
                    else {
                        scope.instance.emailValid = false;
                    }
                }
            }

            scope.close = function() {
                //case when agent is not available and guest clicks x, then we show the email form
                if(scope.initiate) {
                    scope.initiate = false;
                }
                if(!scope.agent) return;
                scope.showBox = false;
                scope.showAlert = true;
            }

            scope.closeCommunication = function() {
                scope.showAlert = false;
                scope.initiate = false;
                scope.serverReponse = 0;
                scope.instance = {text : '', email: '', emailValid : true};
                scope.text = '';
                scope.agent = null;
                GuestService.agent = null;
                GuestService.close();
            }

            scope.cancel = function() {
                scope.showAlert = false;
            }

            scope.anyClick = function() {
                $rootScope.unread = false;
            }
        }
    }
}])