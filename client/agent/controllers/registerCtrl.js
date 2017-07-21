/**
 * Created by avishek on 6/3/17.
 */

App.controller('registerCtrl', ['Auth', '$scope', '$location', '$timeout', function(Auth, $scope, $location, $timeout) {
    $scope.user = {};
    $scope.error = { name : false, email : false, password : false, serverErr : false};
    $scope.serverSucces = false;

    $scope.register = function() {
        $scope.error.serverErr = null;
        $scope.error.name = !Valid.name($scope.user.name);
        $scope.error.email = !Valid.email($scope.user.email);
        $scope.error.password = !Valid.password($scope.user.password);

        if($scope.error.name || $scope.error.email || $scope.error.password) {
            return;
        }
        Auth.signup($scope.user)
            .then(function(res){
                $scope.serverSucces = true;
                $timeout(function(){
                    $location.path('/agent/login');
                }, 2000);
            }, function(err) {
                $scope.error.serverErr = err.data.message;
            })

    }


}])
