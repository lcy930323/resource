define(function (require, exports, module) {

    var defaults = {
        // 默认配置
        template : '<div class="tooltip tooltip-<%= direction %>"> \
                        <span class="tooltip-arrow"></span> \
                        <span class="tooltip-arrow2"></span> \
                        <div class="tooltip-main"><%= content %></div> \
                    </div>',
        // 是否显示箭头
        showArrow : true,
        // 提示框显示的方向
        // - top left right bottom center 自由组合
        align     : 'top center',

        offsetLeft : 5,

        offsetTop  : 5,

        arrowWidth  : 15,

        arrowHeight : 7,

        borderRadius : 6,

        maxWidth   : 'auto',

        content    : '',

        animation  : true,

        delay      : 300
    };

    window.__zIndex = window.__zIndex || 10000;

    /**
     * Plugin Name:         插件模板
     * Plugin Deps:         jquery
     * Plugin Author:       lcy
     * UI Author:           lcy
     * Creating Time:       2015-01-08 18:16:33
     */
    module.exports = (function ($, window, document, undefined) {

        // 常量（插件名）
        var PLUGIN_NAME = 'tooltip';

        // 定义插件类
        function Tooltip(element, options) {
            this.el = element;
            this.$el = $(element);
            this.defaults = Tooltip.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.bindAll();
        }

        // 定义默认选项
        Tooltip.defaults = defaults;

        // 设置默认选项
        Tooltip.setDefaults = function (options) {
            $.extend(Tooltip.defaults, options);
        };


        // 扩展插件原型
        $.extend(Tooltip.prototype, {
            init: function () {
                this.timer = null;
                this.alignHandler();
                this.initEvent();
            },

            initEvent : function() {
                var _this = this,
                    options = this.options;
                this.$el.on('mouseover.tooltip',function(){
                    clearTimeout( _this.timer );
                    _this.renderUI();
                    _this.$UI.on('mouseover.tooltip',function(){
                        clearTimeout( _this.timer );
                    }).on('mouseout.tooltip',function(){
                        clearTimeout( _this.timer );
                        _this.timer = setTimeout(function(){
                            _this.removeUI();
                        },options.delay)
                    });
                }).on('mouseout.tooltip',function(){
                    clearTimeout( _this.timer );
                    _this.timer = setTimeout(function(){
                        _this.removeUI();
                    },options.delay)
                })
            },

            removeUI : function() {
                var margin, animationLeft,
                    _this = this,
                    options = this.options;
                if( !options.animation ) {
                    this.$UI.remove();
                    _this.$UI = null;
                    return false;
                };
                animationLeft = options.animation ? 14 : 0;
                // 处理上下左右四个方向
                switch ( this.direction ){
                    case 'top':
                        margin = { marginTop : animationLeft * -1 };
                        break;
                    case 'bottom':
                        margin = { marginTop : animationLeft };
                        break;
                    case 'right':
                        margin = { marginLeft : animationLeft };
                        break;
                    case 'left':
                        margin = { marginLeft : animationLeft * -1 };
                        break;
                }
                this.$UI.animate($.extend({
                    opacity : 0
                },margin),100,function(){
                    _this.$UI.remove();
                    _this.$UI = null;
                });
            },

            renderUI : function (){
                var options = this.options;
                if( this.$UI ) return false;
                this.$UI = $($.template(options.template,{
                    direction : this.reverse( this.direction ),
                    content   : options.content
                }));
                $('body').append(this.$UI);
                this.setStyle();
            },

            setStyle : function() {
                var width, height, padding, top, left, animationLeft, margin,
                    elWidth, elHeight, elLeft, elRight,
                    arrowTop, arrowLeft,
                    $arrow1, $arrow2,
                    options = this.options;

                this.$UI.css('zIndex',++window.__zIndex);

                $arrow1 = this.$UI.find('.tooltip-arrow');
                $arrow2 = this.$UI.find('.tooltip-arrow2');

                // 处理toolTip宽度
                width   = this.$UI.width();
                padding = parseInt( this.$UI.css('padding') );
                if( width > options.maxWidth ){
                    this.$UI.css('width',options.maxWidth);
                    width = options.maxWidth;
                }
                height  = this.$UI.height();

                elWidth  = this.$el.width();
                elHeight = this.$el.height();
                elLeft   = this.$el.offset().left;
                elTop    = this.$el.offset().top;
                animationLeft = options.animation ? 14 : 0;


                // 处理上下左右四个方向
                switch ( this.direction ){
                    case 'top':
                        top = elTop - height - options.arrowHeight - options.offsetLeft;
                        margin = { marginTop : animationLeft * -1 };
                        break;
                    case 'bottom':
                        top = elTop + elHeight + options.arrowHeight + options.offsetTop;
                        margin = { marginTop : animationLeft };
                        break;
                    case 'right':
                        left = elLeft + elWidth + options.arrowHeight + options.offsetLeft;
                        margin = { marginLeft : animationLeft };
                        break;
                    case 'left':
                        left = elLeft - width - options.arrowHeight - options.offsetLeft;
                        margin = { marginLeft : animationLeft * -1 };
                        break;
                }
                // 处理水平垂直两个方向
                switch ( this.direction ) {
                    case 'top':
                    case 'bottom':
                        switch ( this.align ){
                            case 'left':
                                left = elLeft;
                                arrowLeft = options.borderRadius;
                                break;
                            case 'center':
                                left = elLeft + (elWidth - width) * 0.5;
                                arrowLeft = (width - options.arrowWidth) / 2;
                                break;
                            case 'right':
                                left = elLeft + elWidth - width;
                                arrowLeft = width - options.borderRadius - options.arrowWidth;
                                break;
                        }
                        break;
                    case 'right':
                    case 'left':
                        switch ( this.align ){
                            case 'top':
                                top = elTop;
                                arrowTop = options.borderRadius;
                                break;
                            case 'center':
                                top = elTop + (elHeight - height) * 0.5;
                                arrowTop = (height - options.arrowWidth) / 2;
                                break;
                            case 'bottom':
                                top = elTop + elHeight - height;
                                arrowTop = height - options.borderRadius - options.arrowWidth;
                                break;
                        }
                        break;
                }
                // 处理箭头
                $arrow1.css({
                    top  : arrowTop,
                    left : arrowLeft
                })

                $arrow2.css({
                    top  : arrowTop,
                    left : arrowLeft
                })
                // 设置tip样式
                this.$UI.css($.extend({
                    top  : top,
                    left : left
                },margin));
                this.startAnimation();
            },

            startAnimation : function(){
                var options = this.options;
                if( !options.animation ) return false;
                this.$UI.css('opacity',0);

                this.$UI.animate({
                    opacity : 1,
                    margin  : 0
                },100)
            },

            // 处理对齐
            alignHandler : function() {
                var key1, key2, allowData,
                    options = this.options,
                    allow = 'top left right bottom'.split(' '),
                    align = options.align.split(' ');
                // 对齐方式 对应表
                allowData = {
                    'top'    : 'left center right'.split(' '),
                    'left'   : 'top center bottom'.split(' '),
                    'right'  : 'top center bottom'.split(' '),
                    'bottom' : 'left center right'.split(' ')
                }

                key1 = $.inArray( align[0] ,allow);
                this.direction = key1 == -1 ? 'top' : allow[key1];

                key2 = $.inArray( align[1] ,allowData[ this.direction ]);
                this.align  = key2 == -1 ? 'center' : allowData[ this.direction ][key2];
            },

            reverse : function( align ) {
                var map = {
                    'left'   : 'right',
                    'right'  : 'left',
                    'bottom' : 'top',
                    'top'    : 'bottom'
                }
                return map[ align ];
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
                    $this.data(PLUGIN_NAME, (plugin = new Tooltip(this, options)));
                    plugin.init();
                }
                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

        $.fn[ PLUGIN_NAME ].Constructor = Tooltip;
        $.fn[ PLUGIN_NAME ].noConflict = function () {
            $.fn[ PLUGIN_NAME ] = old;
            return this;
        };
        $.each(allow, function (i,prop) {
            $.fn[PLUGIN_NAME][prop] = Tooltip[prop];
        });

        $.fn.getPlugin = function () {
            return $(this).data(PLUGIN_NAME);
        };

        return Tooltip;

    })(jQuery, window, document);
});