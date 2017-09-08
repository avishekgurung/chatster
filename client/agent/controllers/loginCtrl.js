/**
 * Created by avishek on 6/3/17.
 */

App.controller('loginCtrl',['$scope', 'Auth', '$location', '$rootScope', '$window', function($scope, Auth, $location, $rootScope, $window) {
    console.log('LOGIN CTRL');
    $scope.user = {};
    $scope.error = { email : false, password : false};

    $scope.login = function() {
        $scope.error.serverErr = null;
        $scope.error.email = !Valid.email($scope.user.email);
        $scope.error.password = !Valid.password($scope.user.password);

        if($scope.error.email || $scope.error.password) {
            return;
        }

        Auth.login($scope.user.email, $scope.user.password)
            .then(function(success) {
                $location.path('/');
                $window.document.body.style.background = '#e6ecf0';

            }, function(err) {
                $scope.error.serverErr = err.data.message;
            })
    }
}])