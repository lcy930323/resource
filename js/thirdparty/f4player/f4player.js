define(function (require, exports, module) {

    function Video(options) {
        this.id     = options.id        || '';      // 容器ID
        this.width  = options.width     || '';      // flash 宽度
        this.height = options.height    || '';      // flash 高度
        this.flash  = options.flash     || '';      // 播放器地址
        this.skin   = options.skin      || '';      // 皮肤地址
        this.url    = options.url       || '';      // 视频地址 如果是相对地址则相对于 flash 播放器地址
        this.img    = options.img       || '';      // 缩略图
    }

    Video.prototype.show = function () {
        var html = '<embed type="application/x-shockwave-flash" src="' + this.flash + '" id="f4Player" width="' + this.width + '" height="' + this.height + '" flashvars="skin=' + this.skin + '&video=' + this.url + '&thumbnail=' + this.img + '" wmode="transparent" allowscriptaccess="always" allowfullscreen="true" bgcolor="#000000"/>\
                    <noembed>\
                    You need Adobe Flash Player to watch this video.\
                <a href="http://get.adobe.com/flashplayer/">Download it from Adobe.</a>\
                <a href="http://gokercebeci.com/dev/f4player" title="flv player">flv player</a>\
            </noembed>';
        document.getElementById(this.id).innerHTML = html;
    }

    return Video;
})