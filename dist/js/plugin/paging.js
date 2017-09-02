define(function(require, exports, module){

    //var $ = require('jquery');

    // 默认配置
    var defaults = {
        total           : 68,                       // 总条数
        pageNum         : 1,                        // 当前页
        prePage         : 10,                       // 每页多少条
        count           : 7,                        // 显示页码数
        tag_name        : 'a',                      // 页码标签
        tag_class       : '',                       // 页码标签类名
        tag_other       : ' href="javascript:;"',   // 页码标签其他属性
        skip_name       : 'span',                   // 省略标签
        skip_class      : '',                       // 省略标签类名
        skip_other      : '',                       // 省略标签其他属性
        skip_html       : '...',                    // 省略标签html
        current_class   : 'active',                 // 当前页类名
        first           : false,
        first_name      : 'a',
        first_html      : '首页',
        first_class     : '',
        first_other     : ' href="javascript:;"',
        last            : false,
        last_name       : 'a',
        last_html       : '末页',
        last_class      : '',
        last_other      : ' href="javascript:;"',
        prev            : true,
        prev_name       : 'a',
        prev_html       : '上一页',
        prev_class      : '',
        prev_other      : ' href="javascript:;"',
        next            : true,
        next_name       : 'a',
        next_html       : '下一页',
        next_class      : '',
        next_other      : ' href="javascript:;"',
        afterRender     : null
    }

    module.exports = (function ($, window, document, undefined) {

        // 构造函数
        function Paging( dom, options ){
            this.dom = dom;
            options = options || {};
            this.config = defaults;
            this.init( options );
        }

        // 原型
        $.extend(Paging.prototype ,{
            // 初始化
            init : function( options ){
                options = options || {};
                $.extend( this.config, options );

                this.$dom =  $(this.dom);
                this.getHtml();
            },
            // 获取生成后的html
            getHtml : function(){
                // 定义些变量
                var c = this.config, i,code='';
                // 计算总页数
                var n = Math.ceil( c.total / c.prePage );
                // 页码不正确退出
                if( n < c.pageNum ) return false;

                this.$dom.html('');
                c.pageNum = parseInt( c.pageNum );

                // 首页
                if(c.first ){
                    if( c.pageNum > 1 && c.pageNum < n ){
                        code += this.fill_tag({
                            tag_name  : c.first_name,
                            tag_class : c.first_class,
                            tag_other : c.first_other,
                            tag_html  : c.first_html,
                            tag_code  : 1
                        });
                    }
                }

                // 上一页
                if(c.prev ){
                    if( c.pageNum > 1 ){
                        code += this.fill_tag({
                            tag_name  : c.prev_name,
                            tag_class : c.prev_class,
                            tag_other : c.prev_other,
                            tag_html  : c.prev_html,
                            tag_code  : c.pageNum-1
                        });
                    }
                }

                // 第一种情况 总页数小于页码数
                if( n <= 7 ){
                    for ( i=1; i<=n; i++)
                        code += this.fill_a( i , (i==c.pageNum) );
                } else
                {
                    // 计算偏移值
                    var offset = (c.count-1)/2;

                    // 只有左边有省略号
                    if(c.pageNum <= offset+1 ){
                        var tailer = '';
                        for( i = 0; i <= c.count-2; i++){
                            code += this.fill_a(i+1,(i+1==c.pageNum));
                        }
                        code += this.fill_skip()
                        code += this.fill_a(n);

                    }
                    // 只有右边有省略号
                    else if( c.pageNum >= n-offset  ){

                        code += this.fill_a(1);
                        code += this.fill_skip();

                        for( i = n-(c.count-2); i<= n; i++){
                            code += this.fill_a(i ,(i==c.pageNum))
                        }

                    }
                    // 两边都有省略号
                    else{

                        var header = '';
                        var tailer = '';

                        header += this.fill_a(1);
                        header += this.fill_skip();

                        tailer = this.fill_a(n);
                        tailer = this.fill_skip() + tailer;

                        var partA=partB='';
                        var offset_m = ( c.count - 3 ) / 2;
                        var counter = ( parseInt( c.pageNum ) + parseInt( offset_m ) );

                        for(i = j = c.pageNum ; i <= counter; i ++, j --)
                        {
                            partA = (( i == j ) ? '' :  this.fill_a(j)) + partA;
                            partB += ( i == j ) ? this.fill_a( i ,true ) : this.fill_a( i );
                        }

                        code = code + header + partA + partB + tailer;
                    }
                }

                // 下一页
                if(c.next ){
                    if( c.pageNum < n ){
                        code += this.fill_tag({
                            tag_name  : c.next_name,
                            tag_class : c.next_class,
                            tag_other : c.next_other,
                            tag_html  : c.next_html,
                            tag_code  : c.pageNum+1
                        });
                    }
                }

                // 尾页
                if(c.last){
                    if( c.pageNum > 1 && c.pageNum < n ){
                        code += this.fill_tag({
                            tag_name  : c.last_name,
                            tag_class : c.last_class,
                            tag_other : c.last_other,
                            tag_html  : c.last_html,
                            tag_code  : n
                        });
                    }
                }

                if( n == 1 ) code = '';
                code = '<div class="paging">'+code+'</div>';
                $page = $(code);

                this.bindEvent( $page );

                this.$dom.append( $page );
            },

            // 填充标签
            fill_tag : function( info ){
                if( info.tag_class != '' ) info.tag_class = ' class="'+info.tag_class+'"';
                if( info.tag_other != '' ) info.tag_other = ' '+info.tag_other;
                if( info.tag_code != '' )  info.tag_code = ' data-code="'+info.tag_code+'"';
                return '<'+info.tag_name+info.tag_class+info.tag_other+info.tag_code+'>'+info.tag_html+'</'+info.tag_name+'>';
            },

            // 填充页码
            fill_a : function( num, isCurrent ){
                var c = this.config;
                return this.fill_tag({
                    'tag_name'  : c.tag_name,
                    'tag_class' : isCurrent ? c.current_class+' '+c.tag_class : c.tag_class,
                    'tag_other' : c.tag_other,
                    'tag_html'  : num,
                    'tag_code'  : num
                });
            },

            // 填充省略
            fill_skip : function(){
                var c = this.config;
                return this.fill_tag({
                    'tag_name'  : c.skip_name,
                    'tag_class' : c.skip_class,
                    'tag_other' : c.skip_other,
                    'tag_html'  : c.skip_html,
                    'tag_code'  : ''
                });
            },

            // 绑定点击事件
            bindEvent : function( $page ){
                var _this = this;
                $page.find('a').click(function(){
                    var page_code = this.getAttribute('data-code');
                    _this.config.pageNum = page_code;
                    _this.getHtml();
                    _this.config.afterRender && _this.config.afterRender( page_code );
                    return false;
                })
            },

            get : function( attr ){
                if( this.config[ attr ] ){
                    return this.config[ attr ];
                }
            }


        })

        $.fn.paging = function (options) {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.each(function () {
                var $this = $(this), plugin = $this.data('Paging');

                if (!plugin) {
                    $this.data('Paging', (plugin = new Paging(this, options)));
                    plugin.init();
                }

                if (typeof options == 'string') {
                    plugin[options].apply(plugin, args);
                }
            });
        };

    })($, window, document);

})