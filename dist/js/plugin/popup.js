define(function (require, exports, module) {

    var defaults = {
        // 遮罩层
        mark: true,
        // 关闭按钮
        close: true,
        // 宽度
        width: null,
        // 高度
        height: 'auto',
        // 内补
        padding: 20,
        // 自动关闭
        timeout: null,
        // 显示头
        isHeader: true,
        // 显示尾
        isFooter: true,
        // 高度溢出后的间隙
        space: 10
    };
    /**
     * Plugin Name:         Popup
     * Plugin Deps:         jquery, underscore
     * Plugin Author:       lcy
     * UI Author:           lcy
     * Creating Time:       2014-11-18 16:20:19
     */
    module.exports = (function ($, window, document, undefined) {

        // 常量（插件名）
        var PLUGIN_NAME = 'Popup';

        // 定义插件类
        function Popup(options) {
            this.defaults = Popup.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.init();
        }

        // 定义默认选项
        Popup.defaults = defaults;

        // 设置默认选项
        Popup.setDefaults = function (options) {
            $.extend(Popup.defaults, options);
        };
        // 全局zIndex 遮罩层是否显示
        window.__zIndex || (window.__zIndex = 100001);
        (window.__Mark === false) || (window.__Mark = false);

        // 扩展插件原型
        $.extend(Popup.prototype, {
            init: function () {
                this.getUI();
            },
            // 显示弹窗
            show: function () {
                // 遮罩层
                if (this.options.mark) {
                    this.showMark();
                }

                $('body').append(this.$content);
                this.$content.show();
                this.setPosition();
                this.bindEvent();
            },

            // 显示遮罩
            showMark: function () {
                if (!window.__Mark) {
                    $('body').append(this.$mark);
                    this.$mark.show()
                    window.__Mark = true;
                }
            },

            // 隐藏遮罩
            hideMark: function () {
                window.__Mark = false;
                this.options.mark && this.$mark.remove();
            },

            // 绑定弹窗事件
            bindEvent: function () {
                var _this = this;
                this.$content.find('.popup-close').click(function () {
                    _this.hide();
                })
                $(document).keyup(function (e) {
                    if (e.keyCode == 27) {
                        _this.hide();
                    }
                })

                if (this.options.mark) {
                    this.$mark.click(function () {
                        _this.hide();
                    })
                }

                this.$content.click(function () {
                    return false;
                })

                if (parseInt(this.options.timeout) > 0) {
                    setTimeout(function () {
                        _this.hide();
                    }, parseInt(this.options.timeout))
                }

                $(window).on('resize', function () {
                    _this.setPosition();
                })
            },
            // 隐藏弹窗
            hide: function () {
                this.hideMark();
                this.$content.remove();
                $.isFunction( this.options.onClose ) && this.options.onClose();
            },

            resize: function () {
                this.setPosition();
            },

            // 设置坐标 及大小
            setPosition: function () {
                var c = this.options;
                var hd = this.$content.find('.popup-hd');
                var bd = this.$content.find('.popup-bd');
                var ft = this.$content.find('.popup-ft');

                var box_size = {};
                var bd_size;
                var hd_size = this.toSize(hd);
                var ft_size = this.toSize(ft);

                var _W = $(window).width();
                var _H = $(window).height();

                // 宽度存在
                if (c.width) {
                    this.$content.css('width', c.width - c.padding * 2);
                    box_size.width = c.width - c.padding * 2;
                }

                // 高度存在
                if (c.height !== 'auto') {
                    this.$content.css('height', c.height);
                    bd.css('height', c.height - hd_size.height - ft_size.height - c.padding * 2);
                } else {
                    bd.css("height", 'auto');
                }

                bd_size = this.toSize(bd);

                // 处理高度
                box_size.height = hd_size.height + bd_size.height + ft_size.height + c.padding * 2;
                if (box_size.height >= _H) {
                    bd_size.height = _H - hd_size.height - ft_size.height - c.space * 2 - c.padding * 2;
                    bd.css({
                        "height": bd_size.height
                    })
                    this.$content.css('height', _H - c.space * 2);
                } else {
                    this.$content.css('height', box_size.height);
                    bd.css({
                        "height": c.height - hd_size.height - ft_size.height - c.padding * 2
                    })
                }

                // 处理宽度
                if (box_size.width >= _W) {
                    this.$content.css('width', _W - c.space * 2 - c.padding * 2);
                } else {
                    this.$content.css('width', c.width);
                }

                box_size = this.toSize(this.$content);

                this.$content.css({
                    'left': (_W - box_size.width) * 0.5,
                    'top': (_H - box_size.height) * 0.5
                });
            },
            // 获取元素
            getUI: function () {
                var $UI = $('<div class="popup"></div>');
                var data = {};
                if (this.options.mark) {
                    this.$mark = $('<div class="popup-mark"></div>');
                }
                if (this.options.close) {
                    $UI.append($('<a class="popup-close" href="javascript:;"></a>'));
                }

                data.title = this.options.title ? this.options.title : '系统提示';
                data.content = this.options.content ? this.options.content : '';

                this.options.isHeader && $UI.append($('<div class="popup-hd">' + data.title + '</div>'));
                $UI.append($('<div class="popup-bd">' + data.content + '</div>').css('padding', this.options.padding));
                this.options.isFooter && $UI.append($('<div class="popup-footer"></div>'));

                this.$content = $UI;
            },

            toSize: function (el) {
                if ($(el).length == 0) {
                    return { width: 0, height: 0 }
                }
                return {
                    width: parseInt($(el).width()),
                    height: parseInt($(el).height())
                }
            },

            /**
             * 设置配置
             * @param prop 属性
             * @param val 值
             * @returns {Silde}
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


        $.popup = function (options) {
            var p1 = new Popup(options);
            p1.show();
            p1.options.callback && p1.options.callback();
            return p1;
        };

        $.notice = function (text, time) {
            window.__NOTICE = (window.__NOTICE || []);
            var p1 = new Popup({
                isHeader: false,
                isFooter: false,
                close: false,
                content: text,
                padding: 20,
                mark: false,
                timeout: time || 3000
            });

            // 关闭现有的notice
            $.each( window.__NOTICE, function() {
                this.hide();
            })
            window.__NOTICE.length = 0;
            p1.show();
            window.__NOTICE.push( p1 );
            return p1;
        };

        return Popup;

    })(jQuery, window, document);
});