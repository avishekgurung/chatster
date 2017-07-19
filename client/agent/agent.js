/**
 * Created by avishek on 7/17/17.
 */
var App = angular.module('agent', ['ngRoute']);

App.run(['$rootScope', '$location', 'Auth', '$http', 'AuthToken', 'ChatService', function($rootScope, $location, Auth, $http, AuthToken, ChatService) {
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
            $location.path('/');
        } else {
            Auth.getUser()
                .then(function(res) {
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
            //ChatService.close();
            $location.path('/agent/login');
        }
    }

}]);
