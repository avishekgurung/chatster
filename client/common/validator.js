/**
 * Created by avishek on 7/17/17.
 */


var Valid = (function () {

    //Email Validator
    function email(email) {
        if(!email) return false;
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    }


    //Password Validator
    function password(password) {
        return true;
    }

    function array(arr) {
        if(!arr) return false;
        return arr.constructor.toString().toLowerCase().indexOf('array') !== -1;
    }

    return  {
        email : email,
        password : password,
        array : array
    }

})();