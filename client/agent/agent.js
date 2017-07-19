/**
 * Created by avishek on 7/17/17.
 */
var App = angular.module('agent', ['ngRoute']);

App.run(['$rootScope', '$location', 'Auth', '$http', 'AuthToken', 'ChatService', function($rootScope, $location, Auth, $http, AuthToken, ChatService) {
    var pageReload = true;
    var path = $location.path();

    if(path === '/guest') return;

    $rootScope.$on('$routeChangeStart', function (event) {
        if(pageReload) {
            pageReload = false;
            return;
        }
    })

    //cases when page reloads
    var token = AuthToken.getToken();
    if(token) {
        $http.defaults.headers.common['x-access-token'] = token;
    }


    if(token) {
        if(path === '/agent/login' || path === '/agent/register') {
            $location.path('/');
        } else {
            Auth.getUser()
                .then(function(res) {
                    $rootScope.user = res.data.user;
                    ChatService.open(res.data.user._id);

                }, function(err) {
                    $location.path('/agent/login');
                    AuthToken.setToken();
                })
        }
    }
    else {
        if(path !== '/agent/login' && path !== '/agent/register') {
            //ChatService.close();
            $location.path('/agent/login');
        }
    }

}])


/*App.directive('test', function() {
    return  {
        templateUrl : "app/test.html"
    }
});


var chatContainer = document.getElementById("avishek_gurung");
function headerClicked (event){
    var target = event.target;
    var targetClass = target.getAttribute("class");
    var chatHead = event.currentTarget;
    var chatBox = chatHead.parentElement;
    if(targetClass === 'chat-close-box') {
        chatContainer.removeChild(chatBox);
    }
    else {
        var chatBoxClass = chatBox.getAttribute("class");
        if(chatBoxClass.indexOf("chat-box-minz") !== -1) { //already minimize
            if(targetClass !== "chat-minz-box") {
                chatBox.setAttribute("class", "chat-box chat-box-maxz");
            }
        }
        else {
            chatBox.setAttribute("class","chat-box chat-box-minz");
        }
    }
}*/
