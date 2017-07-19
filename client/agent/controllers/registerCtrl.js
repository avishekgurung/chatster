/**
 * Created by avishek on 6/3/17.
 */

App.controller('registerCtrl', ['Auth', '$scope', '$http', function(Auth, $scope, $http) {
    console.log('SIGN UP CTRL');
    $scope.user = {};
    $scope.error = { name : false, email : false, password : false};

    $scope.register = function() {
        $scope.serverErr = null;
        $scope.error.name = !$scope.user.name;
        $scope.error.email = !Valid.email($scope.user.email);
        $scope.error.password = !Valid.password($scope.user.password);

        if($scope.error.email || $scope.error.password) {
            return;
        }
        Auth.signup($scope.user)
            .then(function(res){
                $scope.serverSucces = res.data.message;
            }, function(err) {
                $scope.serverErr = err.data.message;
            })

    }


}])
