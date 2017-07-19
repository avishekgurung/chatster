/**
 * Created by avishek on 7/17/17.
 */

App.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'agent/views/home.html',
            controller : 'homeCtrl'
        })

        .when('/home', {
            templateUrl: 'agent/agent.html',
            controller : 'homeCtrl'
        })

        .when('/agent/login', {
            templateUrl : 'agent/views/login.html',
            controller : 'loginCtrl'
        })

        .when('/agent/register', {
            templateUrl : 'agent/views/register.html',
            controller : 'registerCtrl'
        })

        .when('/agent/profile', {
            templateUrl : 'agent/views/profile.html'
        })

        .when('/test', {
            templateUrl : 'agent/views/test.html'
        })


/*        .when('/guest', {
            templateUrl : 'app/views/pages/chat/guest.html',
            controller : 'guestCtrl'
        })*/

        .otherwise({
            templateUrl : '/agent/pageNotFound.html'
        })


    $locationProvider.html5Mode(true);
});