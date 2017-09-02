/**
 * ----------------------------------
 * Module Name: FaustCplus
 * Module Type: View
 * Module Deps: base
 * ----------------------------------
 * Created by ZhangShu on 2014-07-24 10:30.
 */
define(function (require, exports, module) {
    var swfobject = require('plugin/swfobject');
    var _ = require('underscore');

	 function uploadHandler (code, response, uid) {

            switch (code) {
                //上传成功
                case 1:
                    Base.Util.ajaxDone(response, this.options.onUploadSuccess);
                    break;
                //js调用上传:swfobject.getObjectById('FaustCplus').jscall_updateAvatar();
                case 2:
                    Base.Util.log('js call upload');
                    Base.Util.ajaxDone(response, this.options.onUploadSuccess);
                    break;
                //取消上传
                case -1:
                    Base.Util.log('cancel!');
                    _.result(this.options,'onUploadCancel');
                    break;
                //上传失败（通信失败）
                case -2:
                    emsg = 'upload failed!';
                    break;
                //超过上传限制（似乎触发不了，待研究）
                case -3:
                    emsg = 'oversize!';
                    break;
                //文件类型错误（似乎触发不了，待研究）
                case -4:
                    emsg = 'wrong file type!';
                    break;
                default:
                    emsg = 'undefined error';
            }
        }
	
	var flash_path = ST.PATH.FLASH,
                options = this.options;

            window.uploadHandler = uploadHandler;

            //传入flash的变量
            var flash_vars = _.extend(options, {
                //上传成功后的Js回调方法
                "jsfunc": "window.uploadHandler"
            });

            //加上裁剪区大小
            var pSize = flash_vars.pSize.split('|'), width, height;
            flash_vars.pSize = '300|300|' + flash_vars.pSize;
            width = parseInt(pSize[0],10) + 350;
            height = parseInt(pSize[1],10) + 150;

            //flash参数
            var params = {
                menu: "false",
                scale: "noScale",
                allowFullscreen: "true",
                allowScriptAccess: "always",
                wmode: "transparent",
                bgcolor: "#FFFFFF"
            };

            //flash属性
            var attributes = {
                id: "FaustCplus"
            };

            var swfplaceholder = this.$('[role="swfplaceholder"]').get(0);

            swfobject.embedSWF(
                options.flashUrl||defaults.flashUrl,
                swfplaceholder,
                width,
                height,
                "9.0.0",
                flash_path + "expressInstall.swf",
                flash_vars,
                params,
                attributes);


});