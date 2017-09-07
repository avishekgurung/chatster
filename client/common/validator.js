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
        return !!password;
    }

    function name(name) {
        if(!name) return false;
        if(name.length < 1) return false;
        return true;
    }

    function array(arr) {
        if(!arr) return false;
        return arr.constructor.toString().toLowerCase().indexOf('array') !== -1;
    }

    function sleep(seconds) {
        var date = new Date().getTime() + (seconds * 1000);
        while ( new Date().getTime() < date ) {

        }
        return true;
    }

    function makeDate(epoch) {
        var date = (!epoch && typeof epoch !== 'number' && epoch.toString().length < 13) ? new Date() : new Date(epoch);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var dt = date.getDate();
        var day = days[date.getDay()];
        var hours = date.getHours();
        var minutes =  date.getMinutes();

        return 	day + ", " + hours + ":" + minutes + " on " + dt + "/" + month + "/" + year;
    }

    return  {
        name : name,
        email : email,
        password : password,
        array : array,
        sleep : sleep,
        makeDate : makeDate
    }

})();

if(typeof module !== "undefined") {
    module.exports = Valid;
}