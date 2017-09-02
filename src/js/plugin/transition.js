define(function (require, exports, module) {

    var browser = require('./browser.js');
    require('plugin/jquery.bez.min.js');
    require('plugin/jquery.mousewheel.js');

    var support = (browser.ie && browser.ie < 10) ? false : true;
    var browserName;

    for (attr in browser) {
        browserName = attr;
    }

    var defaults = {
        // 默认配置
        'wrap': document,
        'itmeCls': '.T-item',
        'mode': 'vertical',
        'loop': true,
        'speed': 2000,
        'autoplay': false,
        'bez': '0.86,0,0.07,1',
        '3d' : false,
        'onInitLoad': null,
        'onStart': null,
        'onStop': null
    };
    /**
     * Plugin Name:         插件模板
     * Plugin Deps:         jquery
     * Plugin Author:       lcy
     * UI Author:           lcy
     * Creating Time:       2015-01-08 18:16:33
     */
    module.exports = (function ($, window, document, undefined) {

        // 常量（插件名）
        var PLUGIN_NAME = 'transition';

        // 定义插件类
        function Transition(element, options) {
            this.el = element;
            this.$el = $(element);
            this.defaults = Transition.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.bindAll();
        }

        // 定义默认选项
        Transition.defaults = defaults;

        // 设置默认选项
        Transition.setDefaults = function (options) {
            $.extend(Transition.defaults, options);
        };


        // 扩展插件原型
        $.extend(Transition.prototype, {
            init: function () {
                this.items = this.$(this.options.itmeCls);
                this.length = this.items.length;
                this.iNow = 0;
                this.bBtn = true;
                this.tid = null;

                // 整理参数
                this.setParam();
                // 初始化一些必要样式
                this.initStyle();

                this.bindMousewheel();
            },
            // 绑定鼠标事件
            bindMousewheel : function(){
                var _this = this;
                this.$el.on('mousewheel',function(e ,delta){
                    if( delta == 1 ){
                        _this.prev();
                    }else if( delta == -1 ) {
                        _this.next();
                    }
                })
            },
            // 处理参数
            setParam: function () {
                var _this = this, bez;

                if (!support) {
                    bez = this.options.bez.split(',');
                    for (var i = 0; i < bez.length; i++) {
                        bez[i] = parseFloat(bez[i]);
                    }
                    this.options.bez = bez;
                }

                if (this.options.autoplay) {
                    this.startAutoPlay();
                    $(window).focus(function () {
                        _this.startAutoPlay();
                    })
                    $(window).blur(function () {
                        _this.stopAutoPlay();
                    })
                }
            },
            // 初始化样式
            initStyle: function () {

                var _this = this,
                    options = this.options,
                    model;

                this.$el.css('overflow', 'hidden');
                this.items.css({
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'width': '100%',
                    'height': '100%'
                })


                if (support) {

                    model = (options.mode == 'horizontal') ? 'X' : 'Y';
                    this.items.css('transform', 'translate' + model + '(100%)').eq(this.iNow).css('transform', 'translate' + model + '(0)');

                    var str = 'all ' + parseInt(options.speed) / 1000 + 's cubic-bezier(' + options.bez + ')';
                    setTimeout(function () {
                        _this.items.css({
                            'transition': str
                        });
                    })
                } else {

                    model = (options.mode == 'horizontal') ? 'left' : 'top';
                    this.items.css(model, '100%').eq(this.iNow).css(model, '0');

                }
                setTimeout(function () {
                    _this.triggerHandler('initLoad');
                })
            },

            // 直接设置样式
            setStyle: function (obj, attr, value) {
                var tem, a;
                var trs = $.cssProps[ 'transition' ] || $.cssProps[ 'transition' ];

                var origName = $.camelCase(attr);
                attr = $.cssProps[ origName ] || $.cssProps[ origName ];

                tem = obj.style[trs];
                obj.style[trs] = 'none';
                obj.style[attr] = value;
                a = getComputedStyle(obj)[attr];
                obj.style[trs] = tem;
            },

            // 切换
            tab: function (targetIndex, delta) {
                if (!this.bBtn) {
                    return false;
                }
                this.bBtn = false;
                // 设置目标元素的样式
                this.setNextStyle(targetIndex, delta);
                if (this.triggerHandler('start',targetIndex + '') === false) {
                    return false;
                }
                var options = this.options;
                var iNowTarget;
                var nextTarget;

                var target = (delta == -1) ? '-100' : '100';
                var model;
                if (support) {

                    iNowTarget = (options.mode == 'horizontal') ? 'translateX(' + target + '%)' : 'translateY(' + target + '%)';
                    nextTarget = (options.mode == 'horizontal') ? 'translateX(0)' : 'translateY(0)';

                    this.items.eq(this.iNow).css('transform', iNowTarget);
                    this.items.eq(targetIndex).css('transform', nextTarget);

                } else {

                    iNowTarget = target + '%';
                    nextTarget = target;

                    model = (options.mode == 'horizontal') ? 'left' : 'top';

                    var iNowTargetName = {};
                    var nextTargetName = {};
                    iNowTargetName[ model ] = iNowTarget;
                    nextTargetName[ model ] = iNowTarget;

                    this.items.eq(this.iNow).animate(iNowTargetName, options.speed, $.bez(options.bez));
                    this.items.eq(targetIndex).animate(nextTargetName, options.speed, $.bez(options.bez));

                }

                setTimeout($.proxy(function () {
                    this.iNow = targetIndex;
                    this.bBtn = true;
                    this.triggerHandler('stop', this.iNow + '');
                }, this), options.speed);
            },

            // 设置下一个样式
            setNextStyle: function (targetIndex, delta) {
                var target = (delta == -1) ? '100' : '-100',
                    options = this.options,
                    model;

                if (support) {
                    model = options.mode == 'horizontal' ? 'X' : 'Y';
                    this.setStyle(this.items.eq(targetIndex)[0], 'transform', 'translate' + model + '(' + target + '%)');
                } else {
                    model = options.mode == 'horizontal' ? 'left' : 'top';
                    this.items.eq(targetIndex).css(model, target + '%');
                }
            },

            // 下一张
            next: function () {
                var index = this.iNow;
                if (this.options.autoplay) {
                    this.stopAutoPlay();
                    this.startAutoPlay();
                }
                if (index + 1 >= this.length) {
                    if (this.options.loop) {
                        index = -1;
                    } else {
                        return false;
                    }
                }
                this.tab(index + 1, -1);
            },

            // 上一张
            prev: function () {
                var index = this.iNow;
                if (this.options.autoplay) {
                    this.stopAutoPlay();
                    this.startAutoPlay();
                }
                if (index - 1 <= -1) {
                    if (this.options.loop) {
                        index = this.length;
                    } else {
                        return false;
                    }
                }
                this.tab( index-1 ,1);
            },

            // 获取当前第几张
            getiNow: function () {
                return this.iNow;
            },
            // 跳到指定页
            play : function( index ){
                if( index >= this.length || index < 0 || index == this.iNow ){
                    return false;
                }
                this.tab( index ,index < this.iNow ? 1 : -1);
            },
            // 开启自动播放
            startAutoPlay : function(){
                var options = this.options;
                var speed = parseInt( options.autoplay );
                if( isNaN(speed) || speed <= options.speed ){
                    return false;
                }
                this.tid  = setInterval($.proxy(function(){
                    if( this.iNow+1 >= this.length ){
                        if( options.loop ){
                            this.iNow = -1;
                        }else{
                            this.stopAutoPlay();
                            return false;
                        }
                    }
                    this.tab( this.iNow+1 ,-1);
                },this),speed);
            },
            // 关闭自动播放
            stopAutoPlay : function(){
                clearTimeout( this.tid );
                this.options.autoPlay = false;
            },

            //绑定接口事件
            bindAll: function () {
                var _this = this;
                var re = /^on([A-Z].*)/;
                $.each(this.options, function (key, val) {
                    if (re.test(key) && $.isFunction(val)) {
                        var evName = key.match(re)[1];
                        evName = evName.charAt(0).toLowerCase() + evName.substring(1);
                        _this.$el.on(evName, $.proxy(val,_this));
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
                    $this.data(PLUGIN_NAME, (plugin = new Transition(this, options)));
                    plugin.init();
                }
                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

        $.fn[ PLUGIN_NAME ].Constructor = Transition;
        $.fn[ PLUGIN_NAME ].noConflict = function () {
            $.fn[ PLUGIN_NAME ] = old;
            return this;
        };

        $.each(allow, function (i, prop) {
            $.fn[PLUGIN_NAME][prop] = Transition[prop];
        });

        $.fn.getTransition = function () {
            return $(this).data(PLUGIN_NAME);
        };

        return Transition;

    })(jQuery, window, document);
});