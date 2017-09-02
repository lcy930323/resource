define(function (require, exports, module) {
    //var jQuery = require('jquery');
    
    var defaults = {
        // 是否ajax提交
        isAjax: true,
        // 消息模板
        messageTpl: $.template('<div role="v-msg" class="validator-message <%= type %>"><i class="validator-icon validator-icon-<%= type %>"></i><%= msg %></div>'),
        // 成功的模板的类名
        success: 'success',
        // 失败的模板的类名
        error: 'error',
        // 成功的模板图标的类名
        iconSuccess: 'validator-icon-success',
        // 失败的模板图标的类名
        iconError: 'validator-icon-error',
        // 显示成功的消息
        showSuccess: true,
        // 显示失败的消息
        showError: true,
        // 集中显示错误
        errorId : null,
        // 元素值为空时是否检测
        checkRequired : false,
        // ajax提交的配置
        ajaxOption : {},
        // 远程验证的统一配置
        remoteOptions : null,
        // 提交成功方法
        onSubmitSuccess: null,
        // 通信错误
        onSubmitError: null,
        // 验证前
        onValidatorAfter: null,
        // 验证成功后 提交前
        onSubmitBefore: null
    };
    /**
     * Plugin Name:         validator
     * Plugin Deps:         jquery, underscore
     * Plugin Author:       @silence
     * Creating Time:       2014-10-28 15:29
     */
    module.exports = (function ($, window, document, undefined) {

        // 常量（命名空间，插件名，插件命名空间）
        var PLUGIN_NAME = "validator";

        // 定义插件类
        function Validator(element, options) {
            this.el = element;
            this.$el = $(element);
            this.defaults = Validator.defaults;
            this.options = $.extend({}, this.defaults, options);
            this.bindAll();
        }

        // 定义默认选项
        Validator.defaults = defaults;

        // 设置默认选项
        Validator.setDefaults = function (options) {
            $.extend(Validator.defaults, options);
        };

        // 事件映射
        Validator.eventMap = {
            'input': 'blur',
            'textarea': 'blur',
            'select': 'change',
            'checkbox': 'change',
            'radio': 'change'
        };

        // 默认语言包
        Validator.lang = {
            required: '此项必填',
            length: '长度不符合',
            int: '正整数',
            int_: '负整数',
            number: '数字',
            decimal: '小数',
            decimal_: '负小数',
            letter: '字母',
            chinese: '汉字',
            ip: 'ip地址',
            qq: 'qq号码',
            phone: '手机号码',
            email: '邮箱',
            card: '身份证',
            zipCode: '邮政编码',
            url: '网址',
            range: '范围不合法',
            regexp: '规则不合法',
            compare: '两次输入不一致'
        };

        Validator.rules = {
            // 返回false为验证失败
            // this 为表单form
            required: {
                test: function (value) {
                    return !(value === '');
                }
            },
            // 长度
            length: {
                test: function (value, min, max) {
                    return (value.length >= min && value.length <= max);
                }
            },
            // 中文算俩字符
            length2: {
                test: function (value, min, max) {
                    value = value.replace(/[\u4E00-\u9FAF]/g,'**');
                    return (value.length >= min && value.length <= max);
                }
            },

            // 正整数
            int: /^[1-9]\d*$/,
            // 负整数
            int_: /^-[1-9]\d*$/,
            // 整数
            number: /^-?[1-9]\d*$/,
            // 小数
            decimal: /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/,
            // 小数
            decimal_: /^-([1-9]\d*\.\d*|0\.\d*[1-9]\d*)$/,
            // 字母
            letter: /^[a-zA-Z]+$/,
            // 汉字
            chinese: /^[\u4E00-\u9FAF]+$/,
            // ip
            ip: /^\d+\.\d+\.\d+\.\d+$/,
            // qq
            qq: /^[1-9][0-9]{4,}$/,
            // phone
            phone: /^[1-9]\d{10}$/,
            // email
            email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            // 身份证
            card: /^\d{15}|\d{18}$/,
            // 身份证
            zipCode: /^[1-9]\d{5}(?!\d)$/,
            // url
            url: /^[a-zA-z]+:\/\/[^\s]*$/,

            // 范围
            range: {
                test: function (value, min, max) {
                    return (value >= parseInt(min) && value <= parseInt(max));
                }
            },

            // 万能的正则
            regexp: {
                test: function (value, rule) {
                    return new RegExp(rule).test(value);
                }
            },

            // 万能的函数
            fn : {
                test: function ( value ) {
                    var fnName = arguments[1] || '';
                    var arg = Array.prototype.slice.call(arguments, 2);
                    arg.unshift(value);
                    return window[fnName] ? window[fnName]( arg ) : true;
                }
            },

            // 比较
            compare: {
                test: function (value, id) {
                    var taigetValue = $.trim($("#" + id).val());
                    return value === taigetValue;
                }
            },
            // 远程验证
            remote: {
                test: function( form, value, url ){
                    var $this = this;
                    var remoteOptions = {};
                    var data;

                    $.isFunction( form.options.remoteOptions ) && (remoteOptions = form.options.remoteOptions( this ));
                    try {
                    $.ajax($.extend({
                        "url" : url,
                        "type" : "post",
                        "dataType" : "json",
                        "async" : false,
                        "data" : { "key" : value }
                    },remoteOptions))
                        .done(function(response){
                            data = response;
                            var msg = response.info || '';
                            if( response.status == 'success' ){
                                form.showSuccessMsg( $this, msg );
                            }else {
                                form.isSubmit = false;
                                form.showErrorMsg( $this, msg );
                            }
                        })
                        .fail(function(){
                            form.isSubmit = false;
                        });
                    } catch (e){
                        console.log( e );
                        return false;
                    }
                    
                    return data.status == "success";
                }
            }

        }


        // 扩展插件原型
        $.extend(Validator.prototype, {
            //初始化方法：插件初始化后自动调用
            init: function () {
                // ajax的时候防止重复提交
                this.repeatSubmit = false;
                // 是否通过所有验证
                this.isSubmit = false;
                // 绑定事件
                this.bindEvent();

                delete this.init;
                return this;
            },

            // 绑定form事件
            bindEvent: function () {
                // 表单提交事件
                this.bindSubmit();
                // 验证元素事件
                this.bindElement();
            },

            // 绑定提交事件
            bindSubmit: function () {
                var _this = this;
                // 绑定表单提交事件
                this.$el.on('submit', function (e) {

                    if( this.repeatSubmit ) {
                       // alert('请不要重复提交');
                       return false;
                    }

                    // 触发验证前事件
                    _this.triggerHandler('validatorBefore');
                    // 获取需要验证的元素
                    var $els = _this.selectDoms();
                    // 设置提交变量 为真， 如果在验证过程中没有出错 则可以提交
                    _this.isSubmit = true;

                    // 验证每一个元素
                    $els.each(function (index, el) {
                        if( !_this.isSubmit && _this.options.errorId ) return false;
                        // 获取元素的标签名 来触发对应的事件
                        var tagName = el.tagName.toLowerCase();
                        // 触发验证事件
                        $(el).trigger(Validator.eventMap[tagName],'submit');
                    });

                    // 触发提交前事件
                    if (_this.isSubmit) _this.triggerHandler('submitBefore');

                    // 验证成功则提交
                    if (_this.isSubmit && _this.options.isAjax) {
                        var data = $.toParam(_this.$el.serializeArray());
                        var url = $.trim(_this.$el.attr('action'));
                        var type = _this.$el.attr('method') || 'post';
                        var ajaxOption = _this.options.ajaxOption || {};

                        if (url != '') {
                            // 重复提交标识
                            _this.repeatSubmit = true;
                            $.ajax($.extend(true,{
                                'url': url,
                                'type': type,
                                'data': data,
                                "dataType" : "json"
                            },ajaxOption)).done(function(response){
                                // 重复提交标识
                                _this.repeatSubmit = false;
                                _this.triggerHandler('submitSuccess',response);
                            }).fail(function(){
                                // 重复提交标识
                                _this.repeatSubmit = false;
                                _this.triggerHandler('submitError');
                            })
                        }
                    }

                    // 根据标识判断是否让表单提交
                    return !_this.options.isAjax && _this.isSubmit;
                });
            },

            // 获取需要验证的元素
            selectDoms: function () {
                return this.$el.find('[data-rules]');
            },

            // 绑定dom交互事件
            bindElement: function () {
                var _this = this;
                // 获取需要验证的元素
                var $els = this.selectDoms();
                // 绑定验证元素事件
                this.$el.on('blur change','[data-rules]',function(e,type){
                    if( _this.checkEvent(e.target ,e.type) ) return false;
                        if( $(this).attr('data-ignore') == 'true' ) {
                        _this.hideMsg(this);
                        return false;
                    }
                    // 验证元素
                    _this.checkElement(this,type);
                })

            },

            // 防止事件重复触发
            checkEvent : function( el, type ) {
                var tagName = el.tagName.toLowerCase();
                var tagType = el.getAttribute('type');
                if( (tagName == 'input' && (tagType == 'text' || tagType == 'password')) || tagName == 'textarea' ){
                    return type != 'focusout';
                } else {
                    return type !== 'change';
                }
            },

            // 解析dom上的规则集合
            parseRules: function (el) {
                var _this = this;
                // dom上的规则 并处理非法字符
                var rules = $.trim($(el).attr('data-rules'));

                // 格式化规则为数组
                var rulesArr = [];
                $.each(rules.split(' '), function (i ,item) {
                    var rule = _this.parseRule(item);
                    rulesArr.push(rule);
                })
                return rulesArr;
            },

            // 解析规则
            parseRule: function (str) {
                var pars = [];
                var rule = '';
                // 解析规则 名称和参数
                str.replace(/^(.*?)\((.*?)\)$/g, function ($0, $1, $2) {
                    rule = $1;
                    pars = $2.split('-');
                });
                return { 'rule': rule || str, 'pars': pars }
            },

            // 解析错误消息
            parseMessage: function (el) {
                var msg = el.getAttribute('data-msg') || '';
                return $.trim(msg).split(' ');
            },

            // 检测元素
            checkElement: function (el,type) {
                // 元素自身的规则
                var rules = this.parseRules(el);
                // 元素规则所对应的错误消息
                var message = this.parseMessage(el);
                // 元素的值
                var value = $.trim($(el).val());
                // 标记  标记元素是否出错    true正确 false错误
                var flag = true;

                // 元素值为空的时候不验证
                if( !!this.options.checkRequired && value === '' && type != 'submit' ){
                    this.hideMsg(el);
                    return true;
                }

                // 验证每一条规则
                for (var i = 0, len = rules.length; i < len; i++) {
                    // 整合参数
                    var currRule = Validator.rules[ rules[i].rule ];
                    var result = null;
                    rules[i].pars.unshift(value);
                    if( rules[i].rule == 'remote' ) {
                        // if( type == 'submit' ) break;
                        rules[i].pars.unshift(this);
                    }

                    // 过滤无效规则
                    if (currRule) {
                        // 验证结果   如果是正则就直接test否则进行自定义处理
                        result = (currRule instanceof RegExp) ? currRule.test(value) : currRule.test.apply(el, rules[i].pars);
                        // 如果验证失败
                        if ( result === false ) {
                            // 显示错误消息
                            this.showErrorMsg(el, message[i] || (Validator.lang[ rules[i].rule ] || ''), rules[i].rule);
                            // 标记错误
                            flag = false;
                            // 不让提交
                            this.isSubmit = false;
                            // 跳出验证 （待配置）
                            break;
                        }
                    }
                }
                // 如果验证成功则显示正确消息
                flag && this.showSuccessMsg(el);
                // 返回元素验证结果
                return flag;
            },

            // 显示错误消息
            showErrorMsg: function (el, msg, rule) {
                var helper, $parent, event, ret;
                // 消息容错处理
                if (!msg) msg = '';

                // 获取错误消息的容器
                helper = $(el).attr('data-helper');
                $parent = helper ? $(helper) : $(el).parent();

                // 删除已经存在的消息元素
                $parent.find('[role="v-msg"]').remove();

                // 判断错误消息是否集中显示
                if( this.options.errorId ){
                    $parent = $("#"+this.options.errorId);
                    $parent.html('');
                }

                if( !this.options.showError ) {
                    return false;
                }
                // 触发元素验证事件
                event = $.Event('error');

                $(el).trigger(event, { 'msg' : msg, 'rule' : rule });

                if( !event.isDefaultPrevented() === false ){
                    return false;
                }
                $parent.append(this.fillTpl('error', msg));
            },

            // 显示成功消息
            showSuccessMsg: function (el, msg) {
                var helper, $parent;
                // 消息容错处理
                if (!msg) msg = '';

                // 获取错误消息的容器
                helper = $(el).attr('data-helper');
                $parent = helper ? $(helper) : $(el).parent();

                // 删除已经存在的消息元素
                $parent.find('[role="v-msg"]').remove();

                // 判断错误消息是否集中显示
                if( this.options.errorId ){
                    $parent = $("#"+this.options.errorId);
                    $parent.html('');
                }
                if( !this.options.showSuccess ) {
                    return false;
                }
                // 触发元素验证事件
                var event = $.Event('success');
                $(el).trigger(event,msg);
                if( !event.isDefaultPrevented() === false ){
                    return false;
                }
                $parent.append(this.fillTpl('success', msg));
            },

            // 隐藏消息
            hideMsg : function( el ){
                $(el).parent().find('[role="v-msg"]').remove();
            },

            // 填充消息模板
            fillTpl: function (type, msg) {
                // 消息模板
                return $(this.options.messageTpl({
                    type : type,
                    msg  : msg
                }));
            },

            /**
             * dom相关
             */
            //获取元素的jquery对象
            $: function (selector) {
                return this.$container.find(selector);
            },
            /**
             * 事件接口
             */
            //将配置中的接口绑定到事件
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
             * 配置相关
             */
            //设置配置
            setOptions: function (prop, val) {
                var options = {};
                if (typeof prop == 'string') {
                    val != undefined && (options[prop] = val);
                } else {
                    options = prop;
                }
                $.extend(this.options, options);
                return this;
            }
        });

        var old = $.fn[ PLUGIN_NAME ];
        var allow = ['defaults', 'setDefaults'];

        $.fn[ PLUGIN_NAME ] = function (options) {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.each(function () {
                var $this = $(this), plugin = $this.data(PLUGIN_NAME);

                if (!plugin) {
                    $this.data(PLUGIN_NAME, (plugin = new Validator(this, options)));
                    plugin.init();
                }

                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

        $.fn[ PLUGIN_NAME ].Constructor = Validator;
        $.fn[ PLUGIN_NAME ].noConflict = function () {
            $.fn[ PLUGIN_NAME ] = old;
            return this;
        };
        $.each(allow, function (i,prop) {
            $.fn[PLUGIN_NAME][prop] = Validator[prop];
        });

        $.fn.getValidator = function () {
            return $(this).data(PLUGIN_NAME);
        };

        return Validator;

    })(jQuery, window, document);
});