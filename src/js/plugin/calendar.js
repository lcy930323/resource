define(function (require, exports, module) {

    require('plugin/moment');
    require('plugin/jquery.mousewheel');

    var tpl       = require('plugin/tpl/calendar.html');
    var tpl_month = require('plugin/tpl/calendar_month.html');

    var defaults = {
        // 默认配置
        type: 'single',   //multiple single

        maxYear: '2020',
        minYear: '2000',

        maxMonth: '12',
        minMonth: '3',

        maxDay: '12',
        minDay: '3',

        maxDate: null,
        minDate: null,

        // 默认20年后
        defaultMaxDate: new Date().getTime() + 20 * 365 * 24 * 60 * 60 * 1000,
        defaultMinDate: new Date().getTime() - 20 * 365 * 24 * 60 * 60 * 1000,

        // 是否显示时间
        showTime: false,

        format : "YYYY-MM-DD",

        formatRange : "{1} 至 {2}",

        firstWeek : 6,

        displayCount : 1,

        selectClose : true,

        hackTop   : 1,

        hackLeft  : 0,

        // 显示上月
        showOther : false,

        // 时分秒步长
        hoursStep   : 1,
        minutesStep : 1,
        secondsStep : 15,

        weekText  : ['一','二','三','四','五','六','日'],

        monthText : ['','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],

        // 接口
        onSelected : null

    };

    // 日期对象
    function MyDate(str, data) {

        if( !(this instanceof MyDate) ){
            return new MyDate(str, data);
        }

        this.date = moment(str);
        // class 的状态
        // - curr 本月  prev 上月  next 下月  active 选中
        this.data = $.extend({},{
            cls_disabled : false,
            cls_curr     : false,
            cls_prev     : false,
            cls_next     : false,
            cls_active   : false,
            cls_stop     : false,
            cls_start    : false
        },data);
        // 更新对象属性
        this.reset();
    }

    // 原型
    MyDate.prototype = {

        constructor : MyDate,
        // 更新对象属性
        reset : function () {
            this.time    = parseInt(this.date.valueOf() / 1000)*1000 ;
            this.year    = this.date.format("YYYY");
            this.month   = this.date.format("M");
            this.day     = this.date.format("D");
            this.week    = this.date.format("E");
            this.hour    = this.date.format("HH");
            this.minute  = this.date.format("mm");
            this.second  = this.date.format("ss");
            this.string  = this.date.format("YYYY-MM-DD HH:mm:ss");
            this.ymd     = this.date.format("YYYY-MM-DD");
            this.ym      = this.date.format("YYYY-MM");
            this.invalid = this.date.isValid();
        },
        // moment startOf
        startOf : function( unit ) {
            this.date.startOf( unit );
            this.reset();
            return this;
        },

        // 设置数据
        setData : function( data ){
            $.extend(this.data,data);
            return this;
        },

        // 前N月
        prevMonth : function( n ) {
            this.date.add( (n || 1) * -1, 'M');
            this.reset();
            return MyDate( this.string );
        },
        // 后N月
        nextMonth : function( n ) {
            this.date.add( n || 1, 'M');
            this.reset();
            return MyDate( this.string );
        },
        // 前N年
        prevYear : function( n ) {
            this.date.add( (n || 1) * -1, 'year');
            this.reset();
            return MyDate( this.string );
        },
        // 后N年
        nextYear : function( n ) {
            this.date.add( n || 1, 'year');
            this.reset();
            return MyDate( this.string );
        },
        // 获取元素class
        getCls : function(){
            var cls = '';
            for ( attr in this.data ){
                if( /^cls_/i.test(attr) && this.data[ attr ] === true ){
                    cls += ' ' + attr.match(/^cls_([a-zA-Z]*)/)[1];
                }
            }
            return cls;
        }

    }

    window.__CALENDAR = window.__CALENDAR || [];

    /**
     * Plugin Name:         插件模板
     * Plugin Deps:         jquery
     * Plugin Author:       lcy
     * UI Author:           lcy
     * Creating Time:       2015-01-08 18:16:33
     */
    module.exports = (function ($, window, document, undefined) {

        // 常量（插件名）
        var PLUGIN_NAME = 'calendar';

        // 定义插件类
        function Calendar(element, options) {
            this.el = element;
            this.$el = $(element);
            this.defaults = Calendar.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.bindAll();
        }

        // 定义默认选项
        Calendar.defaults = defaults;

        // 设置默认选项
        Calendar.setDefaults = function (options) {
            $.extend(Calendar.defaults, options);
        };

        // 扩展插件原型
        $.extend(Calendar.prototype, {
            // 初始化
            init: function () {

                // 初始化数据
                this.initData();
                // 初始化配置
                this.parse();
                // 初始化dom事件
                this.initEvent();

                this.triggerHandler('inited');
            },

            // 初始化数据
            initData : function() {
                // 插件数据
                this.data = {};
                // 视图数据
                this.data.view = {};
                this.data.view.top    = [];
                this.data.view.header = [];
                this.data.view.body   = [];
                this.data.view.count  = 0;
                this.data.view.currDate = MyDate();
                this.data.view.selected = {};

                if( this.options.type == 'multiple' ){
                    this.data.view.selected.start = null;
                    this.data.view.selected.end   = null;
                } else {
                    this.data.view.selected = MyDate();
                }

                // 如果显示时间面板则点击面板不关闭
                if( this.options.showTime ) {
                    this.options.selectClose = false;
                    this.options.type        = 'single';

                    // 如果格式化是默认值则加上时分秒
                    if( this.options.format == defaults.format ){
                        this.options.format = "YYYY-MM-DD HH:mm:ss"
                    }
                }

            },

            // 解析参数
            parse: function () {
                var maxDate, minDate,
                    _this = this,
                    options = this.options;
                // 处理最大日期
                maxDate = options.maxDate ? MyDate(options.maxDate) : MyDate("" + options.maxYear +'-'+ options.maxMonth +'-'+ options.maxDay);
                if (!maxDate.invalid) {
                    maxDate = MyDate(options.defaultMaxDate);
                }
                // 处理最小日期
                minDate = options.minDate ? MyDate(options.minDate) : MyDate("" + options.minYear +'-'+ options.minMonth +'-'+ options.minDay);
                if (!minDate.invalid) {
                    minDate = MyDate(options.defaultMinDate);
                }

                this.data.maxDate = maxDate;
                this.data.minDate = minDate;

                // hack面板个数
                if( (options.displayCount - 1) > this.diffMonth( maxDate, minDate ) ){
                    options.displayCount = this.diffMonth( maxDate, minDate ) + 1;
                }
            },

            // 初始化事件
            initEvent: function () {
                var _this = this,
                    options = this.options;
                this.isOpen = false;
                this.$el.on('click.calendar', function () {
                    _this.setValue();
                    $.each(window.__CALENDAR,function(){
                        if( this !== _this ){
                            this.destroyUI();
                        }
                    })
                    _this.isOpen ? _this.destroyUI() : _this.renderUI();
                    return false;
                });
            },

            // 渲染UI
            renderUI: function ( currentDate, selectedDate ) {
                var monthData, $monthView, temDate,
                    minDate, maxDate, num1, num2,
                    viewCurr,
                    _this = this,
                    options = this.options;
                // 销毁已有UI
                this.destroyUI();
                // 开关
                this.isOpen = true;
                // 当前视图日期对象 和 选中日期对象
                currentDate  = currentDate  || MyDate(this.data.view.currDate.ymd);
                selectedDate = selectedDate || this.data.view.selected;

                // 最大日期 最小日期
                minDate   = this.data.minDate;
                maxDate   = this.data.maxDate;

                // 当前视图离最大最小日期的长度
                num1 = this.diffMonth( currentDate, maxDate );
                num2 = this.diffMonth( currentDate, minDate );

                // hack
                if( num1 >= (1 - options.displayCount)  ){
                    currentDate = MyDate( maxDate.ymd ).prevMonth( options.displayCount - 1 );
                }
                // hack
                if( num2 < 0 ) {
                    currentDate = MyDate( minDate.ymd );
                }

                // 设置当前月份
                this.data.view.currDate = MyDate( currentDate.ymd );

                // 临时日期
                temDate = MyDate( currentDate.ymd );
                for(var i = 0,len = options.displayCount; i < len; i++) {
                    this.data.view.top[i]   = MyDate( temDate.ymd );
                    temDate                 = temDate.nextMonth();
                }

                // UI元素
                this.$UI = $($.template(tpl).call(this,{ it: this.data.view.top }));

                $('body').append( this.$UI );

                // 渲染多个月份
                for(var i = 0,len = options.displayCount; i < len; i++){
                    this.data.view.body[i]  = this.getMonthData( currentDate, selectedDate );
                    $monthView              = $($.template(tpl_month).call(this,{ it : this.data.view.body[i], vid : i }));
                    currentDate             = currentDate.nextMonth();
                    this.$UI.find('.calendar-bd').append( $monthView );
                }

                // UI事件
                this.UIEvent();
                // 设置坐标
                this.resetPosition();
            },

            // 设置默认值（从dom获取）
            setValue : function() {
                var value, temDate, start, end, str,
                    _this = this,
                    options = this.options;

                // 区分范围选择
                if( options.type == 'multiple' ){
                    this.data.view.selected.start = null;
                    this.data.view.selected.end = null;
                    this.data.view.count  = 0;
                } else {
                    this.data.view.select = null;
                }

                value = this.$el.val();
                str   = options.formatRange;

                // 区分范围选择
                if( options.type == 'multiple' ){
                    str = str.replace('{1}','').replace('{2}','');
                    if( value.split(str).length == 2 ){
                        this.data.view.selected.start   = MyDate( value.split(str)[0] );
                        this.data.view.selected.end     = MyDate( value.split(str)[1] );
                    }
                } else {
                    temDate = MyDate( value );
                    if( temDate.invalid ) {
                        this.data.view.selected = MyDate( value );
                        this.data.view.currDate = MyDate( value );
                    }
                }
            },

            // 设置UI坐标
            resetPosition : function(){
                var left, top, height, width,
                    _this = this,
                    options = this.options;

                left = this.$el.offset().left;
                top  = this.$el.offset().top;

                height = this.$el.outerHeight();

                this.$UI.css({
                    top : height + top + options.hackTop,
                    left : left + options.hackLeft,
                    width : this.$UI.width(),
                    height : this.$UI.height()
                });
            },

            // 销毁UI
            destroyUI : function() {
                var options = this.options;
                this.isOpen = false;
                this.$UI    && this.$UI.remove();
            },

            // 面板选择以后
            selectDateAfter : function(  ) {
                var $days, value,
                    _this = this,
                    options = this.options,
                    viewData = this.data.view;
                // 区分范围选择
                if( options.type == 'multiple' ){
                    value = options.formatRange
                                .replace("{1}",viewData.selected.start.date.format( options.format ))
                                .replace("{2}",viewData.selected.end.date.format( options.format ));
                } else {
                    value = viewData.selected.date.format( options.format )
                }
                // 设置dom值
                this.$el.val( value );
                // 触发事件
                this.triggerHandler('selected',viewData.selected);

                // 根据配置是否关闭UI
                options.selectClose && this.destroyUI( true );
            },

            // 各种事件
            UIEvent : function() {
                var $days, $prevYear, $nextYear, $prevMonth, $nextMonth,
                    $hours, $minutes, $seconds, $today, $ok, bingMouseWheel,
                    _this    = this,
                    options  = this.options,
                    viewData = this.data.view;

                // 一些元素
                $days      = this.$UI.find('.calendar-panel .panel-bd .day').not('.disabled');
                $prevYear  = this.$UI.find('.calendar-hd .year-prev');
                $nextYear  = this.$UI.find('.calendar-hd .year-next');
                $prevMonth = this.$UI.find('.calendar-hd .month-prev');
                $nextMonth = this.$UI.find('.calendar-hd .month-next');

                // 日期点击后
                $days.on('click',function(){

                    if( $(this).hasClass('day-hide') ){
                        return false;
                    }

                    var date, count, index, tem, vid;
                    // 元素上的值
                    index = $(this).data("index");
                    vid   = $(this).data("vid");
                    date  = MyDate( viewData.body[vid][ index ].ymd + ' ' + getTime() );

                    // 区分范围选择
                    if( options.type === 'multiple' ){
                        viewData.count ++;
                        viewData.currDate = MyDate( viewData.body[vid][ index ].string );
                        // 第一下点击
                        if( viewData.count % 2 == 1 ){
                            viewData.selected.start = date;
                            viewData.selected.end   = null;
                            _this.renderUI();
                        } else {
                            // 第二下点击
                            viewData.selected.end   = MyDate( viewData.body[vid][ index ].string );
                            viewData.count = 0;
                            if( viewData.selected.end.time < viewData.selected.start.time ){
                                tem = viewData.selected.start;
                                viewData.selected.start = viewData.selected.end;
                                viewData.selected.end = tem;
                            }
                            _this.renderUI();
                            _this.selectDateAfter();
                        }
                    } else {
                        // 单选
                        viewData.currDate = date;
                        viewData.selected = date;
                        _this.renderUI();
                        _this.selectDateAfter();
                    }
                    return false;
                }).on('mouseover',function(){
                    if( !$(this).hasClass('day-hide') ){
                        $(this).addClass('hover');
                    }
                }).on('mouseout',function(){
                    $(this).removeClass('hover');
                });

                // 上一年
                $prevYear.on('click',function(){
                    var date = MyDate( viewData.currDate.string ).prevYear();
                    viewData.currDate = date;
                    _this.renderUI();
                    return false;
                })

                // 下一年
                $nextYear.on('click',function(){
                    var date = MyDate( viewData.currDate.string ).nextYear();
                    viewData.currDate = date;
                    _this.renderUI();
                    return false;
                })

                // 上一月
                $prevMonth.on('click',function(){
                    var date = MyDate( viewData.currDate.string ).prevMonth();
                    viewData.currDate = date;
                    _this.renderUI();
                    return false;
                })
                // 下一月
                $nextMonth.on('click',function(){
                    var date = MyDate( viewData.currDate.string ).nextMonth();
                    viewData.currDate = date;
                    _this.renderUI();
                    return false;
                })

                // 时分秒鼠标事件
                bingMouseWheel = function ( $el ,min, max, step ) {
                    $el.hover(function(){
                        $(this).addClass('hover');
                        $(this).on('mousewheel.calendar',function(e, delta){
                            var value = parseInt( this.innerHTML );
                            delta > 0 ? (value += step) : (value -= step);
                            if( value >= max ) {
                                value = min;
                            }
                            if( value <= (min - 1) ) {
                                value = (max - step);
                            }
                            this.innerHTML = value < 10 ? '0'+value : value ;
                            return false;
                        })
                    },function(){
                        $(this).removeClass('hover');
                        $(this).off('mousewheel.calendar');
                    })
                };


                // 获取时分秒
                function getTime() {
                    var h, m, s;
                    if( $hours ) {
                        h = $hours.html() || '00';
                    } else {
                        h = '00';
                    }
                    if( $minutes ) {
                        m = $minutes.html() || '00';
                    } else {
                        m = '00';
                    }
                    if( $seconds ) {
                        s = $seconds.html() || '00';
                    } else {
                        s = '00';
                    }
                    return h +':'+ m +':'+ s
                }


                // 如果显示时间
                if( options.showTime ) {
                    // 一些元素
                    $hours     = this.$UI.find('.calendar-ft .time-hours');
                    $minutes   = this.$UI.find('.calendar-ft .time-minutes');
                    $seconds   = this.$UI.find('.calendar-ft .time-seconds');

                    $today     = this.$UI.find('.calendar-ft .ft-today');
                    $ok        = this.$UI.find('.calendar-ft .ft-ok');

                    bingMouseWheel($hours, 0, 24, options.hoursStep);
                    bingMouseWheel($minutes, 0, 60, options.minutesStep);
                    bingMouseWheel($seconds, 0, 60, options.secondsStep);

                    // 今天
                    $today.on('click',function(){
                        viewData.selected = MyDate( MyDate().ymd +' '+ getTime() );
                        viewData.currDate = MyDate( MyDate().ymd );
                        _this.selectDateAfter();
                        _this.renderUI();
                    })

                    // 确定
                    $ok.on('click',function(){
                        viewData.selected = MyDate( viewData.selected.ymd +' '+ getTime() );
                        _this.selectDateAfter();
                        _this.destroyUI();
                    })

                }

                // 面板点击 阻止冒泡
                this.$UI.on('click',function(){
                    return false;
                })

                // 点击其document关闭面板
                $(document).on('click.calendar',function(){
                    _this.destroyUI();
                })
            },

            fixZero : function (num) {
                return num < 10 ? "0"+num : num+"";
            },

            // 获取月视图数据
            // - currentDate  当月MyDate对象
            // - selectedDate 选中日期对象
            getMonthData : function( currentDate, selectedDate ) {
                var days, firstWeek, curr, i, len, data, fixDate, selected,
                    currDate, minDate, maxDate,
                    firstArr, centerArr, lastArr,
                    prevMonth, nextMonth, prevMonthDays,
                    _this = this,
                    options = this.options;
                // 初始化一些变量
                curr      = currentDate;
                selected  = selectedDate;
                firstArr  = [];
                centerArr = [];
                lastArr   = [];

                // 最大日期 最小日期
                minDate   = this.data.minDate;
                maxDate   = this.data.maxDate;

                // 容错处理
                fixDate = function ( date ){
                    date = MyDate(date.ymd);
                    if( date.time < minDate.time ){
                        date = MyDate(minDate.ymd);
                    }
                    if( date.time > maxDate.time ){
                        date = MyDate(maxDate.ymd);
                    }
                    return date;
                }

                // 区分范围选择
                if( options.type == 'multiple' ){
                    if( selected.start ){
                        selected.start = fixDate( selected.start )
                    }
                    if( selected.end ){
                        selected.end   = fixDate( selected.end )
                    }
                } else {
                    selected = fixDate( selected );

                    // hack dom value
                    // this.$el.val( selected.date.format( options.format ) )
                }
                curr = fixDate( curr );

                // 处理头部星期数据
                this.data.view.header = [];
                for(var i = 0,len = 7; i < len; i++){
                    this.data.view.header.push( options.weekText[ (options.firstWeek + i) % len ] );
                }

                // 当前月天数
                days      = this.getDaysByMonth( curr );
                // 当前月第一天星期几 1-7
                firstWeek = this.getFirstWeek( curr );

                // 当月数据
                for(i = 1; i <= days; i++){
                    currDate = MyDate( curr.ym +"-"+ this.fixZero(i) );
                    data = {};
                    // 区分范围选择
                    if( options.type == 'multiple' ) {
                        data = {
                            cls_disabled : (currDate.time > maxDate.time) || (currDate.time < minDate.time ),
                            cls_start    : this.isEqualDay( currDate, selected.start ),
                            cls_stop     : this.isEqualDay( currDate, selected.end ),
                            cls_range    : this.inDateRange( currDate, selected )
                        }
                    } else {
                        data = {
                            cls_active   : this.isEqualDay( currDate, selected ),
                            cls_disabled : (currDate.time > maxDate.time) || (currDate.time < minDate.time )
                        };
                    }
                    data.show = true;
                    centerArr.push( currDate.setData(data) );
                }

                // 上月数据
                // - 计算前面应该补多少天
                prevMonth = MyDate(curr.string).prevMonth();
                prevMonthDays = this.getDaysByMonth( prevMonth );

                for(i = 1,len = (7 - (firstWeek - options.firstWeek - 1) * -1) % 7; i <= len; i++){
                    data = {};
                    currDate = MyDate( prevMonth.ym +"-"+ this.fixZero(prevMonthDays - len + i) );
                    // 区分范围选择
                    if( options.type == 'multiple' ) {
                        data = {
                            cls_disabled : (currDate.time > maxDate.time) || (currDate.time < minDate.time ),
                            cls_start    : this.isEqualDay( currDate, selected.start ),
                            cls_stop     : this.isEqualDay( currDate, selected.end ),
                            cls_range    : this.inDateRange( currDate, selected ),
                            cls_prev     : true
                        }
                    } else {
                        data = {
                            cls_disabled : (currDate.time > maxDate.time) || (currDate.time < minDate.time ),
                            cls_prev     : true
                        };
                    }
                    data.show = !!options.showOther;
                    firstArr.push( currDate.setData(data) );
                }

                // 下月数据
                // - 计算后面应该补多少天
                nextMonth = MyDate(curr.string).nextMonth();
                len = (len + days) % 7 == 0 ? 0 : (7 - (len + days) % 7);
                for(i = 1; i <= len; i++){
                    data = {};
                    currDate = MyDate( nextMonth.ym +"-"+ this.fixZero(i) );
                    // 区分范围选择
                    if( options.type == 'multiple' ) {
                        data = {
                            cls_disabled : (currDate.time > maxDate.time) || (currDate.time < minDate.time ),
                            cls_start    : this.isEqualDay( currDate, selected.start ),
                            cls_stop     : this.isEqualDay( currDate, selected.end ),
                            cls_range    : this.inDateRange( currDate, selected ),
                            cls_next     : true
                        }
                    } else {
                        data = {
                            cls_disabled : (currDate.time > maxDate.time) || (currDate.time < minDate.time ),
                            cls_next     : true
                        };
                    }
                    data.show = !!options.showOther;
                    lastArr.push( currDate.setData(data) );
                }

                // 返回视图值
                return firstArr.concat(centerArr).concat(lastArr);
            },

            // 比较两的日期之间的月份差
            diffMonth : function( date1 , date2 ) {
                date1 = MyDate(date1.ymd).startOf('month');
                date2 = MyDate(date2.ymd).startOf('month');
                return date1.date.diff( date2.date,'month', true);
            },

            // 判断是否是同一天
            isEqualDay : function( date1, date2 ) {
                if( date1 == undefined || date2 == undefined ){
                    return false;
                }
                return date1.ymd === date2.ymd;
            },

            // 判断是否是在时间范围内 并且不是开始和结尾那天
            inDateRange : function( date, dateRange ) {
                var flag, ymdDate = MyDate(date.ymd);
                flag = this.isEqualDay(ymdDate, dateRange.start) || this.isEqualDay(ymdDate, dateRange.end);
                if( dateRange.start == undefined || dateRange.end == undefined ){
                    return false;
                }
                return (ymdDate.time > dateRange.start.time) && (ymdDate.time < dateRange.end.time);
            },

            // 获取当前月有多少天，接收 MyDate 对象
            getDaysByMonth : function( date ) {
                var y, m,
                    mday = [0,31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                date = date instanceof MyDate ? date : MyDate();
                y = date.year;
                m = date.month;
                if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0)//判断是否是闰年
                    mday[2] = 29;
                return mday[m];
            },

            // 获取当月第一天是星期几
            getFirstWeek : function ( date ) {
                date = MyDate( date.ym+'-01' );
                return date.week;
            },

            //绑定接口事件
            bindAll: function () {
                var _this = this;
                var re = /^on([A-Z].*)/;
                $.each(this.options, function (key, val) {
                    if (re.test(key) && $.isFunction(val)) {
                        var evName = key.match(re)[1];
                        evName = evName.charAt(0).toLowerCase() + evName.substring(1);
                        _this.$el.on(evName, $.proxy(val, _this));
                    }
                })
            },
            //触发事件回调
            triggerHandler: function (ev, args) {
                var event = $.Event(ev);
                this.$el.trigger(event, args || []);
                return !event.isDefaultPrevented();
            },
            /**
             * dom相关
             */
            $: function (select) {
                return this.$el.find(select);
            },
            /**
             * 设置配置
             * @param prop 属性
             * @param val 值
             * @returns {Silde}
             */
            setOptions: function (key, val) {
                var options = {};
                if (arguments.length > 1) {
                    val != undefined && (options[key] = val);
                } else {
                    options = key;
                }
                $.extend(this.options, options);
                return this;
            }
        });

        var old = $.fn[ PLUGIN_NAME ],
            allow = ['defaults', 'setDefaults'];

        $.fn[ PLUGIN_NAME ] = function (options) {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.each(function () {
                var $this = $(this), plugin = $this.data(PLUGIN_NAME);
                if (!plugin) {
                    $this.data(PLUGIN_NAME, (plugin = new Calendar(this, options)));
                    plugin.init();
                    window.__CALENDAR.push(plugin);
                }
                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

        $.fn[ PLUGIN_NAME ].Constructor = Calendar;
        $.fn[ PLUGIN_NAME ].noConflict = function () {
            $.fn[ PLUGIN_NAME ] = old;
            return this;
        };
        $.each(allow, function (i, prop) {
            $.fn[PLUGIN_NAME][prop] = Calendar[prop];
        });

        $.fn.getCalendar = function () {
            return $(this).data(PLUGIN_NAME);
        };

        return Calendar;

    })(jQuery, window, document);
});