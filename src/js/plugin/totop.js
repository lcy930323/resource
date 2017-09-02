define(function (require, exports, module) {

    var defaults = {
        // 默认配置
        bottom : 300,

        maxScrollTop : 13140
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
        var PLUGIN_NAME = 'totop';

        // 定义插件类
        function Totop(element, options) {
            this.el = element;
            this.$el = $(element);
            this.defaults = Totop.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.bindAll();
        }

        // 定义默认选项
        Totop.defaults = defaults;

        // 设置默认选项
        Totop.setDefaults = function (options) {
            $.extend(Totop.defaults, options);
        };

        // 扩展插件原型
        $.extend(Totop.prototype, {
            init: function () {
                this.oriBottom = this.$el.css('bottom');
                this.resetDisplay();
                this.initEvent();
            },

            initEvent : function (){
                var _this = this;
                $(window).on('scroll',function(){
                    _this.resetDisplay();
                })

                this.$el.click(function(){
                    var scrollTop = $(document).scrollTop();
                    if( scrollTop > _this.options.maxScrollTop ) {
                        $('html,body').scrollTop(0)
                        return false;
                    }
                    $('html,body').animate({
                        scrollTop : 0
                    })
                })
            },

            resetDisplay : function() {
                var scrollTop = $(document).scrollTop();
                var height    = $(document).height();
                var bottom    = height - scrollTop - $(window).height();
                if( scrollTop  == 0 ){
                    this.$el.hide();
                } else {
                    if( bottom < this.options.bottom - parseInt(this.oriBottom) ) {
                        this.$el.css({
                            bottom : this.options.bottom - bottom
                        })
                    } else {
                        this.$el.css({
                            bottom : this.oriBottom
                        })
                    }
                    this.$el.show();
                }
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
                    $this.data(PLUGIN_NAME, (plugin = new Totop(this, options)));
                    plugin.init();
                }
                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

        $.fn[ PLUGIN_NAME ].Constructor = Totop;
        $.fn[ PLUGIN_NAME ].noConflict = function () {
            $.fn[ PLUGIN_NAME ] = old;
            return this;
        };
        $.each(allow, function (i,prop) {
            $.fn[PLUGIN_NAME][prop] = Totop[prop];
        });

        $.fn.getTotop = function () {
            return $(this).data(PLUGIN_NAME);
        };

        return Totop;

    })(jQuery, window, document);
});