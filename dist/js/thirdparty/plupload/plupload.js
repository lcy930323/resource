define(function (require, exports, module) {

    var $ = require('jquery');
    var _ = require('util');
    var plupload = require('./flash/plupload.js');

    var tpl = '<div class="file-item" id="<%= id %>"> \
                    <span title="<%= name %>"><%= name %></span> \
                    <input type="text" value="<%= name %>" maxlength="100"/> \
                    <div class="loading-bg"></div> \
                    <div class="loading-speed" style="width: 0px"></div> \
                    <a href="javascript:;" class="del">x</a> \
                </div>';

    function Upload(options) {
        this.id            = options.id;
        this.wrapId        = options.wrapId || '';  // 容器id
        this.mime_types    = options.mime_types || []; // 允许上传类型
        this.max_file_size = options.max_file_size || '4mb';
        this.uploadUrl     = options.uploadUrl || '';
        this.flash         = options.flash || './flash/Moxie.swf';
        this.uploadError   = options.uploadError;
        this.serverError   = options.serverError;
        this.uploadSuccess = options.uploadSuccess;
    }

    $.extend(Upload.prototype,{
        init : function(){
            this.wrap = $("#"+this.wrapId);
            this.file_len = 0;  // 文件个数
            this.isLoaded = (this.wrap.find('.file-item').length > 0); // 是否全部上传完整
            this.fileItem = _.template( tpl );
            //实例化一个plupload上传对象
            this.uploader = new plupload.Uploader({
                runtimes : 'html5,flash',
                filters : {
                    mime_types : this.mime_types,
                    max_file_size : this.max_file_size, 
                },
                browse_button : this.id, //触发文件选择对话框的按钮，为那个元素id
                url : this.uploadUrl, //服务器端的上传页面地址
                flash_swf_url : this.flash //swf文件，当需要使用swf方式进行上传时需要配置该参数
            });
            this.uploader.init();
            if( this.wrapId != '' ){
                this.bindEvent();
            }
        },

        bindEvent : function(){
            var _this = this;
            this.uploader.bind('FilesAdded',function(uploader,files){
                var i,len;
                _this.isLoaded = false;
                for( i=0,len=files.length; i<len; i++){
                    _this.wrap.append(_this.fileItem({
                        name : files[i].name,
                        id : files[i].id
                    }));
                    _this.file_len++;
                }
                $("#file-list").show();
                uploader.start();
            });

            // 上传过程中的事件
            this.uploader.bind('UploadProgress',function(uploader,file){
                $("#"+file.id).find('.loading-speed').css('width',file.percent*2);
            });

            // 上传出错的事件
            this.uploader.bind('Error',function (uploader, error){
                _this.uploadError && _this.uploadError.apply(this,arguments);
            });

            // 队列文件上传完之后的事件
            this.uploader.bind('UploadComplete',function (uploader, error){
                _this.isLoaded = true;
            });

            // 上传完成的事件
            this.uploader.bind('FileUploaded',function (uploader,file,responseObject){
                if( responseObject.status == 200 ){
                    var data = _.toJSON(responseObject.response);
                    _this.uploadSuccess && _this.uploadSuccess(data);
                }else{
                    _this.serverError && _this.serverError(data);
                    $("#"+file.id).remove();
                }
            });

            // dom 事件
            _this.wrap.on('blur','input',function(e){
                $(this).parent().removeClass('active');
                var val = $(this).val();
                $(this).val( val );
                $(this).parent().find('span').html( val );
                return false;
            })

            _this.wrap.on('dblclick','.file-item',function(e){
                e.preventDefault();
                $(this).addClass('active');
                $(this).find('input').select();
            }).on('keydown','.file-item',function(e){
                var code = e.keyCode;
                if( code == '13' ){
                    $(this).removeClass('active');
                    var val = $(this).find('input').val();
                    $(this).find('span').html( val ).attr( 'title' ,val );
                    return false;
                }
            }).on('click','.del',function(){
                _this.uploader.removeFile( $(this).parent().attr('id') );
                $(this).parent().remove();
            });
        }
    })

    return Upload;
})