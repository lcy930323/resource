define(function (require, exports, module) {

    this._ = require('./underscore');

    (function (root) {

        // Baseline setup
        // --------------

        // Establish the root object, `window` in the browser, or `global` on the server.
        var _ = root._ || (root._ = require('./underscore'));

        // Helpers
        // -------


        // Mixing in the truthiness
        // ------------------------

        _.mixin({
            //获取时间戳（fixing underscore 1.6.0 以下版本）
            now: Date.now || function () {
                return new Date().getTime();
            },
            /**
             * 转义参数
             * @param {Array} arr
             * eg.
             * [{name:'type',value:'1'},{name:'id',value:'1'}]  //格式同$(...).serializeArray()
             * @returns {}
             */
            toParam: function (arr) {
                var params = {};
                if (_.isArray(arr)) {
                    _.each(arr, function (item) {
                        var name = _.trim(item.name),
                            val = _.trim(item.value);
                        if (name) {
                            if (params[name] != undefined) {
                                if (!_.isArray(params[name])) {
                                    params[name] = [params[name]];
                                }
                                params[name].push(val);
                            } else {
                                params[name] = val;
                            }
                        }
                    });
                }
                return params;
            },
            //转义参数字符串
            toParamString: function (params) {
                var str = '';
                if (params) {
                    var arr = [];
                    _.each(params, function (v, k) {
                        if (_.isArray(v)) {
                            _.each(v, function (n) {
                                arr.push(k + '=' + n);
                            });
                        } else {
                            arr.push(k + '=' + v);
                        }
                    });
                    str = arr.join('&');
                }
                return str;
            },
            //转为字符串（过滤空值）
            toRealString: function (object) {
                switch (object) {
                    case undefined:
                    case null:
                    case NaN:
                        object = '';
                        break;
                    case 0:
                        object = '0';
                }
                return object.toString();
            },
            //字符串转JSON
            toJSON: function (str) {
                var json = null;
                str = _.trim(str) || '{}';
                try {
                    json = (new Function("return " + str))();
                } catch (e) {
                    throw e;
                }
                return json;
            },
            //_.result增强版（支持“方法参数”的和“上下文”配置)
            resultWith: function (object, property, args, context) {
                if (!_.isObject(object)) {
                    return undefined;
                }
                var val = _.isString(property) ? object[_.trim(property)] : object;
                if (_.isFunction(val)) {
                    return val.apply(context || object, args || []);
                } else {
                    return val;
                }
            },
            //去掉前后空格
            trim: function (str, regexp) {
                str = _.toRealString(str);
                regexp = regexp || /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
                return str.replace(regexp, '');
            },
            //字符串截断
            truncate: function (str, num, suffix, isByte) {
                str = _.toRealString(str);
                num = parseInt(num, 10) || 0;
                var subStr = str;
                if (str) {
                    if (!isByte) {
                        subStr = str.substring(0, num);
                    } else {
                        var len = _.byteLength(str),
                            n = Math.min(num, len),
                            arr = [];
                        for (var i = 0; i < len; i++) {
                            n -= str.charCodeAt(i) > 255 ? 2 : 1;
                            if (n >= 0) {
                                arr.push(str.charAt(i));
                            } else {
                                break;
                            }
                        }
                        subStr = arr.join('');
                    }
                    if (subStr && suffix && len > num) {
                        subStr += suffix;
                    }
                }
                return subStr;
            },
            //计算字节长度
            byteLength: function (str) {
                var len = 0;
                str = _.toRealString(str);
                if (str) {
                    for (var i = 0, l = str.length; i < l; i++) {
                        len += str.charCodeAt(i) > 255 ? 2 : 1;
                    }
                }
                return len;
            },
            //小于10补零
            zeroFix: function (num) {
                var n = parseInt(num, 10);
                if (isNaN(n)) return num;
                return n < 10 ? ('0' + n) : n;
            },
            //接口名称转事件名称
            interface2Event: function (name) {
                var result = [];
                name = _.trim(name);
                if (name) {
                    var arr = name.replace(/^on/, '').match(/[A-Za-z]+/g);
                    for (var i = arr.length - 1; i >= 0; i--) {
                        result.push(arr[i].toLowerCase());
                    }
                }
                return result.join(':');
            },
            //事件名称转接口名称
            event2Interface: function (name) {
                var result = [];
                name = _.trim(name);
                if (name) {
                    var arr = name.split(':').reverse();
                    result.push('on');
                    for (var i = arr.length - 1; i >= 0; i--) {
                        var word = arr[i].toLowerCase();
                        word.replace(/^./, function(w){
                            return w.toUpperCase();
                        });
                        result.push(word);
                    }
                }
                return result.join('');
            },
            //判断IE6
            isIE6: function () {
                return _.isUndefined(document.body.style.maxHeight);
            },
            //判断是否简单对象
            isPlainObject: function (x) {
                return _.isObject(x) && x.constructor === root.Object;
            },
            //继承
            inherits: function (_this, base) {
                var baseIsClass = _.isFunction(base);
                if (!_.isFunction(_this)) {
                    if (baseIsClass) {
                        _this = function () {
                            base.apply(this, arguments);
                        }
                    } else {
                        _this = function () {
                        }
                    }
                }
                if (baseIsClass) {
                    var F = function () {
                    };
                    F.prototype = base.prototype;
                    _this.prototype = new F();
                    _this.prototype.constructor = _this;
                    _this.__base__ = base;
                    _this.__baseproto__ = base.prototype;
                }
                return _this;
            },
            //获取模板
            fetchTemplate: function (name, template) {
                name = _.trim(name);
                return (name && template.match(new RegExp('{' + name + '}([\\s\\S]*?){/' + name + '}')) || [])[1] || '';
            },
            /**
             * 时间日期相关
             */

            /**
             * 日期时间格式化
             * @param date {Date} date对象，默认今天
             * @param format {String} 格式，默认'yyyy-MM-dd'
             * @returns {String}
             */
            dateFormatter: function (date, format) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                if (!format) format = 'yyyy-MM-dd';
                var o = {
                    "M+": date.getMonth() + 1,
                    "d+": date.getDate(),
                    "h+": date.getHours(),
                    "m+": date.getMinutes(),
                    "s+": date.getSeconds(),
                    "q+": Math.floor((date.getMonth() + 3) / 3),
                    "S": date.getMilliseconds()
                }
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
                return format;
            },
            /*
             获取周信息
             @return
             字符串（'日','一','二','三','四','五','六'）
             */
            getDayText: function (date, textArray) {
                if (!_.isArray(textArray)) {
                    textArray = ['日', '一', '二', '三', '四', '五', '六'];
                }
                if (!_.isDate(date)) {
                    date = new Date();
                }
                return textArray[date.getDay()];
            },
            /*
             获取日期所在月有多少天
             @return
             @class Number
             */
            getDateCountOfMonth: function (date) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                var year = date.getFullYear(),
                    month = date.getMonth() + 1,
                    count = 30;
                if (month == 2) {
                    if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
                        count = 29;
                    } else {
                        count = 28;
                    }
                } else {
                    if ((month <= 7 && month % 2 == 1) || (month >= 8 && month % 2 == 0)) {
                        count = 31;
                    }
                }
                return count;
            },
            /*
             获取日期所在月的日期数组
             @return
             @class Array[周一的日期,...,周日的日期]
             */
            getDatesOfMonth: function (date, format) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                var year = date.getFullYear(),
                    month = date.getMonth(),
                    count = _.getDateCountOfMonth(date),
                    arr = [];
                for (var i = 1; i <= count; i++) {
                    var dt = new Date(year, month, i);
                    format && (dt = _.dateFormatter(dt, format));
                    arr.push(dt);
                }
                return arr;
            },
            //获取当前月第一天
            getFirstDateOfMonth: function (date) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                var year = date.getFullYear(),
                    month = date.getMonth();
                return new Date(year, month, 1);
            },
            //获取当前月最后一天
            getLastDateOfMonth: function (date) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                var year = date.getFullYear(),
                    month = date.getMonth(),
                    day = _.getDateCountOfMonth(date);
                return new Date(year, month, day);
            },
            //获取日期所在周的日期数组
            getDatesOfWeek: function (date, format) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                var temp = new Date(date.getTime() - date.getDay() * 86400000), // monday
                    arr = [];
                for (var i = 0; i < 7; i++) {
                    if (format) {
                        arr.push(_.dateFormatter(temp, format));
                    } else {
                        arr.push(temp);
                    }
                    temp = new Date(temp.getTime() + 86400000); //next date
                }
                return arr;
            },
            //获取上N天
            getPrevDate: function (date, num) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                num = parseInt(num, 10) || 1;
                return new Date(date.getTime() - num * 86400000);
            },
            //获取下N天
            getNextDate: function (date, num) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                num = parseInt(num, 10) || 1;
                return new Date(date.getTime() + num * 86400000);
            },
            //获取上N月
            getPrevMonth: function (date, num) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                num = parseInt(num, 10) || 1;
                return new Date(date.getFullYear(), date.getMonth() - num, 1);
            },
            //获取下N月
            getNextMonth: function (date, num) {
                if (!_.isDate(date)) {
                    date = new Date();
                }
                num = parseInt(num, 10) || 1;
                return new Date(date.getFullYear(), date.getMonth() + num, 1);
            },
            //判断日期大小
            compareDate: function (date1, date2) {
                var result = 0;
                if (!_.isDate(date1)) {
                    date1 = new Date();
                }
                if (!_.isDate(date2)) {
                    date2 = new Date();
                }
                var t1 = date1.getTime();
                var t2 = date2.getTime();
                if (t1 > t2) {
                    result = 1;
                }
                if (t1 < t2) {
                    result = -1;
                }
                return result;
            },
            /*添加收藏*/
            AddFavorite: function (url, title) {
                try {
                    window.external.addFavorite(url, title);
                }
                catch (e) {
                    try {
                        window.sidebar.addPanel(title, url, "");
                    }
                    catch (e) {
                        alert("加入收藏失败，请使用Ctrl+D进行添加");
                    }
                }
            },
            /*设为首页*/
            SetHome: function (obj, url) {
                try {
                    obj.style.behavior = 'url(#default#homepage)';
                    obj.setHomePage(url);
                }
                catch (e) {
                    if (window.netscape) {
                        try {
                            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                        }
                        catch (e) {
                            alert("此操作被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将 [signed.applets.codebase_principal_support]的值设置为'true',双击即可。");
                        }
                        var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
                        prefs.setCharPref('browser.startup.homepage', url);
                    } else {
                        alert('您的浏览器不支持自动自动设置首页, 请使用浏览器菜单手动设置!');
                    }
                }
            },
            Code: {
                REGX_HTML_ENCODE: /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g,
                REGX_HTML_DECODE: /&\w{1,};|&#\d{1,};/g,
                REGX_ENTITY_NUM: /\d{1,}/,
                HTML_DECODE: {
                    "&lt;": "<",
                    "&gt;": ">",
                    "&amp;": "&",
                    "&nbsp;": " ",
                    "&quot;": "\"",
                    "&copy;": "©"
                },
                encodeHtml: function (s) {
                    s = (s != undefined) ? s : this;
                    return (typeof s != "string") ? s : s.replace(this.REGX_HTML_ENCODE, function ($0) {
                        var c = $0.charCodeAt(0), r = ["&#"];
                        c = (c == 0x20) ? 0xA0 : c;
                        r.push(c);
                        r.push(";");
                        return r.join("");
                    });
                },
                decodeHtml: function (s) {
                    var HTML_DECODE = this.HTML_DECODE,
                        REGX_NUM = this.REGX_ENTITY_NUM;
                    s = (s != undefined) ? s : this;
                    return (typeof s != "string") ? s : s.replace(this.REGX_HTML_DECODE, function ($0) {
                        var c = HTML_DECODE[$0];
                        if (c == undefined) {
                            var m = $0.match(REGX_NUM);
                            if (m) {
                                var cc = m[0];
                                cc = (cc == 160) ? 32 : cc;
                                c = String.fromCharCode(cc);
                            } else {
                                c = $0;
                            }
                        }
                        return c;
                    });
                }
            },
            /*
             获取文字字节长度
             @eg
             "中文aaab".byteLen();
             */
            byteLen: function (str) {
                return str.replace(/[^\x00-\xff]/g, '**').length;
            },
            rtrim : function(str,s){
                if( !s ) s = '/s*';
                return str.replace(new RegExp(s+'+$','g'), "");
            },
            ltrim : function(str,s){
                if( !s ) s = '/s*';
                return str.replace(new RegExp('^'+s+'+','g'), "");
            }
    });

    })(this);

    return _;
});