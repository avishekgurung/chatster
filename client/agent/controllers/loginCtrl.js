/**
 * Created by avishek on 6/3/17.
 */

App.controller('loginCtrl',['$scope', 'Auth', '$location', '$rootScope',function($scope, Auth, $location, $rootScope) {
    console.log('LOGIN CTRL');
    $scope.user = {};
    $scope.error = { email : false, password : false};

    $scope.login = function() {
        $scope.serverErr = null;
        $scope.error.email = !Valid.email($scope.user.email);
        $scope.error.password = !Valid.password($scope.user.password);

        if($scope.error.email || $scope.error.password) {
            return;
        }

        Auth.login($scope.user.email, $scope.user.password)
            .then(function(success) {
                $location.path('/');
            }, function(err) {
                $scope.serverErr = err.data.message;
            })
    }
}])