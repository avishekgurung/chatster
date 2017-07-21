/**
 * Created by avishek on 7/17/17.
 */
var App = angular.module('agent', ['ngRoute']);

App.run(['$rootScope', '$location', 'Auth', '$http', 'AuthToken', 'ChatService', '$window', function($rootScope, $location, Auth, $http, AuthToken, ChatService, $window) {
    var pageReload = true;
    var path = $location.path();

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
            $window.document.body.style.background = '#e6ecf0';
            $location.path('/');
        } else {
            Auth.getUser()
                .then(function(res) {
                    $window.document.body.style.background = '#e6ecf0';
                    $rootScope.agent = res.data.user;
                    ChatService.open(res.data.user._id);

                }, function(err) {
                    $location.path('/agent/login');
                    AuthToken.setToken();
                })
        }
    }
    else {
        if(path !== '/agent/login' && path !== '/agent/register') {
            $location.path('/agent/login');
        }
    }

}]);
