module.exports = {
  setCookie: function(cvalue) {
    var date = new Date();
    date.setTime(date.getTime() + (1*60*60*1000));
    var expires = "expires=" + date.toUTCString();
    document.cookie = "token=" + cvalue + ";" + expires + ";path=/";
  },

  getCookie: function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return false;
  },

  checkCookie: function(cname) {
    var token = this.getCookie(cname);
    if (token==''||token==null) {
      return false;
    } else {
      return true;
    }
  }
}