/**
 * Created by avishek on 6/1/17.
 */


App.factory('AuthToken', ['$window', function ($window) {
        var authToken = {};

        authToken.getToken = function() {
            return $window.localStorage.getItem('token');
        }

        authToken.setToken = function(token) {
            if(token) {
                $window.localStorage.setItem('token', token);
            }
            else{
                $window.localStorage.removeItem('token');
            }
        }

        return authToken;
    }])

    .factory('Auth', ['$http', '$q', 'AuthToken', '$rootScope', 'ChatService', function($http, $q, AuthToken, $rootScope, ChatService) {
        var authFactory = {};

        authFactory.signup = function(user) {
            return $http.post('/api/signup', user);
        }

        //login into the app
        authFactory.login = function(email, password) {
            return $http.post('/api/login', {
                email : email,
                password : password
            }).success(function(data) {
                AuthToken.setToken(data.token);
                $rootScope.user = data.user;
                ChatService.open(data.user._id);
                return 1;
            })
        }

        //logging out
        authFactory.logout = function() {
            /*ChatService.closeCommunication("all");*/
            var chatList = ChatService.createChatList("all");
            ChatService.closeCommunication(chatList, function() {
                console.log('DONE');
                ChatService.close();
                AuthToken.setToken();
            });
            /*ChatService.close();
            AuthToken.setToken();*/
        }

        //if the user is logged in
        authFactory.isLoggedIn = function() {
            return Boolean(AuthToken.getToken());
        }

        authFactory.getUser = function() {
            if(AuthToken .getToken()) {
                return $http.get('/api/me');
            }
            else {
                return $q.reject({'message' : 'user is not known'});
            }
        }

        return authFactory;
    }])

    .factory('AuthInterceptor', ['$q', '$location', 'AuthToken', function($q, $location, AuthToken) {
        var authInterceptor = {};

        authInterceptor.request = function(config) {
            var token = AuthToken.getToken();
            if(token) {
                config.headers['x-access-token'] = token;
            }
            return config;
        }

        authInterceptor.response = function(response) {
            if(response.status === 403) {
                $location.path('/login');
            }
            return $q.reject(response);
        }

        return authInterceptor;
    }])
