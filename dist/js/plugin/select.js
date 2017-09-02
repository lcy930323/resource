define(function (require, exports, module) {
    // var jQuery = require('jquery');
    var defaults = {
        // 模板
        tpl: function (data) {
            var html = '';

            html += ' \
                <div class="select"> \
                    <div class="select-hd"> \
                        <span class="select-text">' + this.options.placeholder + '</span> \
                        <span class="select-icon"> \
                            <i class="select-allow"></i> \
                        </span> \
                    </div> \
                    <div class="select-bd"> \
                    <ul> ';

            for (var i = 0, len = data.list.length; i < len; i++) {
                html += '<li data-key="' + data.list[ i ].key + '" data-index="' + data.list[ i ].index + '">' + data.list[ i ].text + '</li>';
            }

            html += ' </ul> \
                    </div> \
                </div>';
            return html;
        },
        // 默认宽度
        width: 200,
        // 默认高度
        height: '40px',
        // z-index值
        zIndex: 100,
        // 追加加class
        appendClass: '',
        // 占位符  未选中时显示
        placeholder: '请选择',
        // 数据来源  默认自动  可选 dom|ajax
        dataScources: 'auto',
        // 选中的key
        selectedKey: null,
        // 是否选中第一项
        firstSelected: false,
        // 自动选中选中第一项时 是否触发change事件
        firstSelectedTrigger : false,
        // dom操作方式
        mouseenter : true,
        /**
         * ajax相关
         */
        // ajax地址
        ajaxUrl: null,
        // ajaxDom属性
        ajaxUrlKey: 'data-ajax',
        // ajaxMethod属性
        ajaxMethodKey: 'data-method',
        // ajax返回的键
        dataKey: 'key',
        // ajax返回的值
        dataText: 'text',
        // 请求时发送的数据
        ajaxData: null,
        // 处理返回的数据
        parseAjaxData: function (response) {
            return response;
        },

        // 事件
        onChange: null
    };
    /**
     * Plugin Name:         Select
     * Plugin Deps:         jquery, underscore
     * Plugin Author:       Select
     * UI Author:           Select
     * Creating Time:       2014-10-17 17:43
     */
    module.exports = (function ($, window, document, undefined) {

        // 常量（插件名）
        var PLUGIN_NAME = 'select';

        // 定义插件类
        function Select(element, options) {
            this.el = element;
            this.$el = $(element);
            this.defaults = Select.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.bindAll();
        }

        // 定义默认选项
        Select.defaults = defaults;

        // 设置默认选项
        Select.setDefaults = function (options) {
            $.extend(Select.defaults, options);
        };

        // select实例的集合
        window.__SELECT = [];

        // 扩展插件原型
        $.extend(Select.prototype, {

            init: function () {

                this.isOpen = false;
                // 处理配置
                this.parseParam();
            },

            parseParam: function () {
                var _this = this,
                    options = this.options;

                switch (options.dataScources) {
                    case 'dom':
                        this.getDataByDom();
                        break;
                    case 'ajax':
                        this.getDataByAjax();
                        break;
                    default :
                        this.el.selectedIndex !== -1 ?
                            this.getDataByDom() :
                            this.getDataByAjax();
                }

            },

            getDataByAjax: function () {
                var url, method = 'get',
                    data = {},
                    _this = this,
                    options = this.options;

                url = options.ajaxUrl || this.el.getAttribute(options.ajaxUrlKey);
                method = options.method || this.el.getAttribute(options.ajaxMethodKey) || method;
                if (typeof url !== 'string') return false;

                if ($.isFunction(options.ajaxData)) {
                    data = options.ajaxData.call(this);
                }
            

                $.ajax(url, {
                    "type": method,
                    "data": data
                }).done(function (response) {
                    var data = options.parseAjaxData(response);
                    _this.parseRemoteData(data);
                }).fail(function (e, msg, error) {
                    console.error('服务器没反应 url:' + url);
                })
            },

            // 获取dom数据
            getDataByDom: function () {
                var data = {}, i;
                data.list = [];
                for (var i = 0, len = this.el.options.length; i < len; i++) {
                    data.list.push({
                        'key': this.el.options[ i ].value,
                        'text': this.el.options[ i ].text,
                        'index': i
                    })
                }
                this.DATA = data;
                this.renderUI();
            },

            // 解析远程数据
            parseRemoteData: function (data) {
                var options = this.options;
                for (var i = 0, len = data.list.length; i < len; i++) {

                    data.list[i].key = data.list[i][ options.dataKey ];
                    data.list[i].text = data.list[i][ options.dataText ];

                    // 同步dom元素
                    this.el.options.add(new Option(data.list[i].text, data.list[i].key));
                    data.list[i].index = i;
                }
                this.DATA = data;
                this.renderUI();
            },

            // 渲染UI
            renderUI: function () {
                // 渲染过则移除
                this.$ui && this.$ui.remove();
                // 隐藏原生dom
                this.$el.hide();

                this.$ui = $(this.fillTpl());
                this.UIStyle();
                this.UIEvent();
                this.$el.after(this.$ui);

                this.initSelected();
                window.__SELECT.push(this);
            },
            // 初始化选中
            initSelected: function () {
                var options = this.options,
                    key     = this.$el.data('key') || options.selectedKey,
                    type    = key ? 'key' : 'index',
                    val     = key ? key : (options.firstSelected ? 0 : null);
                this.setSelected(val, type, options.firstSelectedTrigger);
            },

            // 填充模板
            fillTpl: function () {
                return this.options.tpl.call(this, this.DATA);
            },
            // ui样式
            UIStyle: function () {
                var options = this.options,
                    $ui = this.$ui,
                    $hd = $ui.find('.select-hd');

                options.appendClass && $ui.addClass(options.appendClass);
                options.height && $ui.css('height', options.height);
                options.height && $hd.css('line-height', options.height);
                options.width && $ui.css('width', options.width);
                options.zIndex && $ui.css('zIndex', options.zIndex);
            },

            // ui事件
            UIEvent: function () {
                var _this = this;
                var hd = this.$ui.find('.select-hd');
                var bd = this.$ui.find('.select-bd');
                var ali = bd.find('li');
                var oText = hd.find('.select-text');
                var oIcon = hd.find('.select-icon');

                hd.on("click",function () {
                    // 关闭其他select
                    $.each(window.__SELECT, function (key, val) {
                        (val !== _this) && val.close();
                    })
                    // 判断显示隐藏
                    _this.isOpen ? _this.close() : _this.open();
                    // 点击其他区域关闭
                    $(document).on('click.select', function () {
                        _this.close();
                        $(document).off('click.select');
                    })
                    return false;
                })

                // hover展开
                if( this.options.mouseenter ) {
                    this.$ui.on('mouseleave', function() {
                        _this.close();
                    }).on("mouseenter", function() {
                        _this.open();
                    });
                }

                ali.hover(function () {
                    $(this).toggleClass('hover');
                }).click(function () {
                    _this.setSelected($(this).data('key'), 'key', true);
                    _this.close();
                    return false;
                })
            },

            close: function () {
                this.$ui.removeClass('open');
                this.$ui.find('.select-bd').stop(true).slideUp(100);
                this.isOpen = false;
                this.triggerHandler('close');
            },

            open: function () {
                this.$ui.addClass('open');
                this.$ui.find('.select-bd').stop(true).slideDown(100);
                this.isOpen = true;
                this.triggerHandler('open');
            },

            setText: function (text) {
                this.$ui.find('.select-text').text(text);
            },
            /*
             *  选中
             *      key  选中的value
             *      type 选中的类型   key|index
             */
            setSelected: function (key, type, flag) {
                var _this = this;
                var k = type === undefined ? 'key' : type;
                if (key === null) {
                    _this.$el.val(null);
                    return false;
                }
                $.each(this.DATA.list, function (i, item) {
                    if (item[ k ] == key) {
                        _this.setText(item.text);
                        _this.$el.val(item.key);
                        _this.$ui.find('.select-bd li').eq(item.index).addClass('selected').siblings().removeClass('selected');

                        !!flag ?
                            _this.$el.trigger('change', item.key) :
                            _this.$el.triggerHandler('change', item.key)
                    }
                })
            },
            // 获取当前值
            getValue: function () {
                return this.$el.val();
            },
            // 重新载入
            reload: function () {
                this.parseParam();
            },
            // 重新载入数据
            fetchData : function( url, options ){
                var _this = this;
                if( url === undefined ) {
                    url = this.options.ajaxUrl || this.el.getAttribute(options.ajaxUrlKey);
                }
                options = options || {};
                $.ajax(url,options).done(function(response){
                    var data = _this.options.parseAjaxData(response);
                    _this.parseRemoteData(data);
                })
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
             * 设置配置
             * @param prop 属性
             * @param val 值
             * @returns {Select}
             */
            setOptions: function (prop, val) {
                var options = {};
                if (arguments.length > 1) {
                    val != undefined && (options[prop] = val);
                } else {
                    options = prop;
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
                    defaults.zIndex--;
                    $this.data(PLUGIN_NAME, (plugin = new Select(this, options)));
                    plugin.init();
                }
                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

        $.fn[ PLUGIN_NAME ].Constructor = Select;
        $.fn[ PLUGIN_NAME ].noConflict = function () {
            $.fn[ PLUGIN_NAME ] = old;
            return this;
        };
        $.each(allow, function (prop) {
            $.fn[PLUGIN_NAME][prop] = Select[prop];
        });

        $.fn.getSelect = function () {
            return $(this).data(PLUGIN_NAME);
        };

        return Select;

    })(jQuery, window, document);
});