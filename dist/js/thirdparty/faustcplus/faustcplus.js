define(function (require, exports, module) {
    var swfobject = require("./flash/swfobject");

    var successFunction = null;

    function Faustcplus(options) {
        this.id             = options.id;
        this.success        = options.success       || new Function();
        this.uploadUrl      = options.uploadUrl     || '';                  // 服务端地址
        this.flash          = options.flash         || '';                  // flash地址
        this.installFlash   = options.installFlash  || '';                  // flash安装地址
        this.pSize          = options.pSize         || '300|280|280|180';   // 显示大小
        this.imgUrl         = options.imgUrl        || '';                  // 初始化时的图片
        this.width          = options.width         || 650;                 // flash 宽度
        this.height         = options.height        || 450;                 // flash 高度

        this.config();
    }

    Faustcplus.prototype.config = function(){

        successFunction = this.success;

        var _this = this;

        this.flash_vars = {
            //上传成功后的Js回调方法
            "jsfunc": "__faustcplus_uploadHandler",
            "pSize": this.pSize,
            "uploadUrl": this.uploadUrl,
            "imgUrl": this.imgUrl,
            "uploadSrc":true,
            "showBrow":true,
            "showCame":false
        }
        //flash参数
        this.params = {
            menu: "false",
            scale: "noScale",
            allowFullscreen: "true",
            allowScriptAccess: "always",
            wmode: "transparent",
            bgcolor: "#FFFFFF"
        };
        //flash属性
        this.attributes = {
            id: "FaustCplus"
        };

    }

    window.__faustcplus_uploadHandler = function(code, response) {

        switch (code) {
            //上传成功
            case 1:
            case 2:
                //todo
                successFunction(response);
                break;
            //取消上传
            case -1:
                break;
            //上传失败（通信失败）
            case -2:
                emsg = 'upload failed!';
                $.notice(emsg);
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



    Faustcplus.prototype.show = function(){
        swfobject.embedSWF(
            this.flash,
            this.id,
            this.width,
            this.height,
            "9.0.0",
            this.installFlash,
            this.flash_vars,
            this.params,
            this.attributes);
    }



    return Faustcplus;
})