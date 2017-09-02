define(function (require, exports, module) {

    var defaults = {
        // 默认配置
        tpl : '<div class="auto-complete"><% if( list && list.length ){ %>' +
            '<ul>' +
            '<% $.each(list,function(i, item){ %>' +
            '<li><%= item.text %></li>' +
            '<% }) %>' +
            '</ul><% } %>' +
            '</div>',

        url : 'autocomplete.json',

        ajaxOptions : null,

        delay : 200,

        maxDisplay : 10
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
        var PLUGIN_NAME = 'autoComplete';

        // 定义插件类
        function AutoComplete(element, options) {
            this.el = element;
            this.$el = $(element);
            this.defaults = AutoComplete.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.bindAll();
        }

        // 定义默认选项
        AutoComplete.defaults = defaults;

        // 设置默认选项
        AutoComplete.setDefaults = function (options) {
            $.extend(AutoComplete.defaults, options);
        };


        // 扩展插件原型
        $.extend(AutoComplete.prototype, {
            // 初始化元素事件
            init: function () {
                this.initEvent();
            },

            // 绑定keyup事件
            initEvent : function() {
                var _this = this,
                    options = this.options;
                this.$el.on('keyup.autocomplete',function(e){
                    var codes = '38,40,13,37,39'.split(',');
                    if( $.inArray(e.which+"", codes) != -1 ){
                        return false;
                    }
                    clearInterval( _this.timer );
                    _this.timer = setTimeout($.proxy(_this.getData,_this), options.delay, $.trim(this.value));
                    return false;
                }).on('click.autocomplete',function(){
                    if( _this.isOpen ) return false;
                    clearInterval( _this.timer );
                    _this.timer = setTimeout($.proxy(_this.getData,_this), options.delay, $.trim(this.value));
                })
            },

            // 从服务器获取数据
            getData : function ( value ){
                var _this = this,
                    options = this.options;

                if( value == '' ) {
                    _this.remove();
                    return false;
                }

                this.defaultValue = value;

                $.ajax($.extend({
                    url   : options.url,
                    cache : false,
                    data  : { key : value || '' },
                    dataType : 'json'
                },options.ajaxOptions)).done(function( response ){
                    if( response.status == 'success' ) {
                        _this.list = response.data;
                        _this.render();
                    }
                })
            },

            // 生成UI并添加UI元素的事件
            render : function() {
                var width   = this.$el.outerWidth(),
                    height  = this.$el.outerHeight(),
                    offset  = this.$el.offset(),
                    options = this.options;
                this.$UI && this.remove();
                if( this.list.length > options.maxDisplay ) {
                    this.list.length = options.maxDisplay;
                }
                this.$UI = $( $.template(options.tpl,{list:this.list}) );
                $('body').append( this.$UI );
                this.$UI.css({
                    width : width,
                    top   : offset.top + height,
                    left  : offset.left
                })

                this.iNow = -1;
                this.UIEvent();
                this.isOpen = true;
            },

            // UI元素的事件
            UIEvent : function (){
                var _this = this;
                $(document).on('keydown.autocomplete',function(e) {
                    switch( e.which ) {
                        case 38:
                            _this.iNow -- ;
                            if( _this.iNow < -1 ){
                                _this.iNow = _this.list.length - 1;
                            }
                            _this.setValue();
                            break;
                        case 40:
                            _this.iNow ++;
                            if( _this.iNow > _this.list.length ){
                                _this.iNow = 0;
                            }
                            _this.setValue();
                            break;
                        case 13:
                            _this.$UI.find('li').eq( _this.iNow ).trigger('click.autocomplete');
                            break;
                    }
                });
                this.$UI.find('li').on('mouseover.autocomplete',function(){
                    _this.iNow = $(this).index();
                    _this.$UI.find('li').removeClass('hover').eq(_this.iNow).addClass('hover');
                }).on('click.autocomplete',function(){
                    _this.iNow = $(this).index();
                    _this.setValue();
                    _this.remove();
                });

                $(document).on('click.autocomplete',function(){
                    _this.remove();
                });

            },

            // 设置元素的值
            setValue : function( index ) {
                if( this.iNow == this.list.length || this.iNow == -1 ){
                    this.$el.val( this.defaultValue );
                    this.$UI.find('li').removeClass('hover');
                } else {
                    this.$el.val( this.list[index || this.iNow].text );
                    this.$UI.find('li').removeClass('hover').eq(this.iNow).addClass('hover');
                }

            },

            // 销毁UI元素
            remove : function (){
                $(document).off('keydown.autocomplete');
                $(document).off('click.autocomplete');
                if( this.$UI ) {
                    this.$UI.find('li').off();
                    this.$UI.remove();
                }
                this.$UI = null;
                this.isOpen = false;
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
                    $this.data(PLUGIN_NAME, (plugin = new AutoComplete(this, options)));
                    plugin.init();
                }
                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

        $.fn[ PLUGIN_NAME ].Constructor = AutoComplete;
        $.fn[ PLUGIN_NAME ].noConflict = function () {
            $.fn[ PLUGIN_NAME ] = old;
            return this;
        };
        $.each(allow, function (i,prop) {
            $.fn[PLUGIN_NAME][prop] = AutoComplete[prop];
        });

        $.fn.getAutoComplete = function () {
            return $(this).data(PLUGIN_NAME);
        };

        return AutoComplete;

    })(jQuery, window, document);
});