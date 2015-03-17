define(function (require, exports, module) {

    var defaults = {
        // 默认配置
        clsInner    : '.js-silde-inner',
        clsItem     : '.js-silde-item',
        clsBtns     : '.js-silde-btns',
        clsPrev     : '.js-silde-prev',
        clsNext     : '.js-silde-next',
        btnTag      : 'li',
        btnActive   : 'active',
        // 轮播类型  1：渐隐  2：左右
        type        : 1,
        // 无缝滚动
        loop        : true,
        autoPlay    : 5000,
        timer       : null,
        btnTimer    : null,
        onSwitch    : function ( e, iNow ){

        }
    };

    // 当前值 和 目标值
    var iNow = 0,
        target = 0;

    /**
     * Plugin Name:         插件模板
     * Plugin Deps:         jquery
     * Plugin Author:       lcy
     * UI Author:           lcy
     * Creating Time:       2015-01-08 18:16:33
     */
    module.exports = (function ($, window, document, undefined) {

        // 常量（插件名）
        var PLUGIN_NAME = 'silde';

        // 定义插件类
        function Silde(element, options) {
            this.el = element;
            this.$el = $(element);
            this.defaults = Silde.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.bindAll();
        }

        // 定义默认选项
        Silde.defaults = defaults;

        // 设置默认选项
        Silde.setDefaults = function (options) {
            $.extend(Silde.defaults, options);
        };

        // 扩展插件原型
        $.extend(Silde.prototype, {
            init: function () {
                this.initEls();
                this.initStyle();
                this.initEvent();
                this.autoPlay();
            },
            // 更新按钮状态
            updateBtns : function (){
                var options = this.options;
                this.$btns.find(options.btnTag).removeClass(options.btnActive).eq(iNow).addClass(options.btnActive);
            },

            // 切换幻灯片
            move : function ( index, fn ){
                var _this = this,
                    options = this.options;
                switch( options.type ){
                    // 渐隐
                    case 1:
                        this.$item.stop(true).animate({
                            opacity : 0
                        }).eq(index).stop(true).animate({
                            opacity : 1
                        })
                        break;
                    // 左右
                    case 2:
                        this.$inner.stop(true).animate({
                            left : index * this.$item.width() * -1
                        },function(){
                            fn && fn();
                        })
                        break;
                }

                this.triggerHandler('switch',index+'');
                this.updateBtns();
            },
            // 自动播放
            autoPlay : function (){
                var _this = this,
                    options = this.options;
                if( !options.autoPlay ) return false;

                options.timer = setInterval(function(){
                    _this.next();
                },options.autoPlay);
            },
            // 停止自动播放
            stopPlay : function() {
                var _this = this,
                    options = this.options;
                clearTimeout( options.timer );
            },
            // 重新开始自动播放
            resetAutoPlay : function() {
                this.stopPlay();
                this.autoPlay();
            },

            // 上一张
            prev : function() {
                var width,
                    length  = this.$item.length,
                    options = this.options;
                iNow--;
                target--;

                if( options.loop && options.type != 1 ){
                    // 无缝滚动处理
                    width = length * this.$item.width() / 2;
                    if( target == -1 ) {
                        this.$inner.css('left',-1 * width)
                        iNow = target = length / 2 - 1;
                    }
                    iNow = iNow % (length / 2);
                    this.move( target );
                } else {
                    iNow = iNow % length;
                    this.move( iNow );
                }
            },

            // 下一张
            next : function() {
                var width,
                    length  = this.$item.length,
                    options = this.options;
                iNow++;
                target++;
                if( options.loop && options.type != 1 ){
                    // 无缝滚动处理
                    width = length * this.$item.width() / 2;
                    if( target == length / 2 + 1 ) {
                        this.$inner.css('left',0)
                        iNow = target = 1;
                    }
                    iNow = iNow % (length / 2);
                    this.move( target );
                } else {
                    iNow = iNow % length;
                    this.move( iNow );
                }
            },

            // 初始化事件
            initEvent : function() {
                var _this = this,
                    options = this.options;
                //
                this.$btns.find( options.btnTag ).click(function(){
                    clearTimeout(options.btnTimer);
                    _this.resetAutoPlay();
                    iNow = $(this).index();
                    target = $(this).index();
                    _this.move( $(this).index() );
                    return false;
                }).mouseover(function(){
                    var This = this;
                    _this.resetAutoPlay();
                    clearTimeout(options.btnTimer);
                    options.btnTimer = setTimeout(function(){
                        iNow = $(This).index();
                        target = $(This).index();
                        _this.move( $(This).index() );
                    },200)
                    return false;
                }).mouseout(function(){
                    clearTimeout(options.btnTimer);
                })

                this.$prev.click(function(){
                    _this.resetAutoPlay();
                    _this.prev();
                })
                this.$next.click(function(){
                    _this.resetAutoPlay();
                    _this.next();
                })
            },
            // 初始化样式
            initStyle : function (){
                var $wrap   = this.$btns,
                    options = this.options;
                switch( options.type ){
                    // 渐隐
                    case 1:
                        this.$item.css({
                            position: 'absolute',
                            top : 0,
                            left : 0,
                            opacity : 0
                        }).eq(0).css({
                            opacity : 1
                        })
                        break;
                    // 左右
                    case 2:
                        this.$item.css({
                            float : 'left'
                        })
                        this.$inner.css({
                            width : this.$item.length * this.$item.width()
                        })
                        break;
                }

                $wrap.html('');
                if( options.btnTag.toLowerCase() == 'li' ){
                    $wrap = $('<ul>');
                    this.$btns.append($wrap);
                }

                this.$item.each(function( index ){
                    if( options.loop && options.type != 1 ){
                        index % 2 && $wrap.append('<'+options.btnTag+'>');
                    } else {
                        $wrap.append('<'+options.btnTag+'>');
                    }
                })

                this.updateBtns();
            },
            // 获取元素
            initEls : function() {
                var options = this.options;
                this.$inner = this.$(options.clsInner);

                // 无缝滚动则复制一份dom
                if( options.loop && options.type != 1 ){
                    this.$inner[0].innerHTML += this.$inner[0].innerHTML;
                }

                this.$item  = this.$(options.clsItem);
                this.$btns  = this.$(options.clsBtns);
                this.$prev  = this.$(options.clsPrev);
                this.$next  = this.$(options.clsNext);
            },

            //绑定接口事件
            bindAll: function () {
                var _this = this;
                var re = /^on([A-Z].*)/;
                $.each(this.options, function( key, val){
                    if( re.test( key ) && $.isFunction(val) ){
                        var evName = key.match( re )[1];
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
            $: function ( select ) {
                return this.$el.find( select );
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
                    $this.data(PLUGIN_NAME, (plugin = new Silde(this, options)));
                    plugin.init();
                }
                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

        $.fn[ PLUGIN_NAME ].Constructor = Silde;
        $.fn[ PLUGIN_NAME ].noConflict = function () {
            $.fn[ PLUGIN_NAME ] = old;
            return this;
        };
        $.each(allow, function (i,prop) {
            $.fn[PLUGIN_NAME][prop] = Silde[prop];
        });

        $.fn.getSilde = function () {
            return $(this).data(PLUGIN_NAME);
        };

        return Silde;

    })(jQuery, window, document);
});