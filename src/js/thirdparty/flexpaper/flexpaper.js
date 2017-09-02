define(function (require, exports, module) {
    var $ = require('jquery');

    //加载flexPaper
    require('./flash/flexpaper.js');
    require('./flash/flexpaper_handlers.js');

    function FlexPaper(options) {
        this.id     = options.id        || '';      // 容器ID
        this.url    = options.url       || '';      // 容器ID
    }

    FlexPaper.prototype.show = function () {

        $("#"+this.id).FlexPaperViewer({
            config : {
                SwfFile : this.url,
                Scale : 1,
                ZoomTransition : 'easeOut',
                ZoomTime : 0.5,
                ZoomInterval : 0.2,
                FitPageOnLoad : true,
                FitWidthOnLoad : false,
                PrintEnabled : true,
                FullScreenAsMaxWindow : false,
                ProgressiveLoading : false,
                MinZoomSize : 0.2,
                MaxZoomSize : 5,
                SearchMatchAll : false,
                InitViewMode : 'Portrait',
                WMode : 'transparent',
                ViewModeToolsVisible : true,
                ZoomToolsVisible : true,
                NavToolsVisible : true,
                CursorToolsVisible : true,
                SearchToolsVisible : true,
                localeChain: 'zh_CN',
                jsDirectory : './flash/'
            }
        });
    }

    return FlexPaper;
})