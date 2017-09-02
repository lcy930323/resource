define(function(require,exports,module){
    
    //    判断浏览器版本来来自于 jQuery
    
    var browser = {};
    var ua = navigator.userAgent.toLowerCase(); 
    var s;

    (s = ua.match(/(msie\s|trident.*rv:)([\w.]+)/)) ? browser.ie = s[2] :

    (s = ua.match(/firefox\/([\d.]+)/)) ? browser.firefox = s[1] :

    (s = ua.match(/chrome\/([\d.]+)/)) ? browser.chrome = s[1] :

    (s = ua.match(/opera.([\d.]+)/)) ? browser.opera = s[1] :

    (s = ua.match(/version\/([\d.]+).*safari/)) ? browser.safari = s[1] : 0;

    module.exports = browser;
    
});