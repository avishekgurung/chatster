/**
 * Created by avishek on 6/8/17.
 */


var App = angular.module('guest', ['ngRoute']);

App.controller('guestCtrl', ['$scope', 'GuestService', function($scope, GuestService) {

    $scope.initiate = function() {
        GuestService.initiate();
    }

}]);
