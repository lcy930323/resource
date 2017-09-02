define(function(require, exports, module) {

    var $ = require('jquery');

    // 加载 图表 和图表事件
    var echarts = require('./js/echarts');
    var ecConfig = require('./js/config');

    var defaults = {
        "tooltip": {
            "trigger": "axis"
        },
        "animation": false,
        "legend": {
            "selectedMode": "single",
            "data": ["总额", "网址弹窗", "IE收藏夹", "桌面图标(游戏)", "桌面图标(娱乐)"],
            "selected": {
                "总额": true,
                "网址弹窗": false,
                "IE收藏夹": false,
                "桌面图标(游戏)": false,
                "桌面图标(娱乐)": false
            }
        },
        "xAxis": [{
            "type": "category",
            "boundaryGap": false,
            "data": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
        }],
        "yAxis": [{
            "type": "value",
            "axisLabel": {
                "formatter": "{value} "
            }
        }],
        "series": [{
            "name": "总额",
            "type": "line",
            "data": ["0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "4550303.60", "4503989.80", "722519.06", "149313.72", "0.00", "0.00"]
        }, {
            "name": "网址弹窗",
            "type": "line",
            "data": ["0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "1093710.65", "1098726.75", "174365.60", "37378.81", "0.00", "0.00"]
        }, {
            "name": "IE收藏夹",
            "type": "line",
            "data": ["0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "1138572.75", "1115026.50", "182002.66", "37254.40", "0.00", "0.00"]
        }, {
            "name": "桌面图标(游戏)",
            "type": "line",
            "data": ["0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "1147986.95", "1115014.90", "180417.12", "36722.13", "0.00", "0.00"]
        }, {
            "name": "桌面图标(娱乐)",
            "type": "line",
            "data": ["0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "1170033.25", "1175221.65", "185733.68", "37958.38", "0.00", "0.00"]
        }]
    };

    function Echarts(dom, options) {
        this.option = $.extend(defaults, options);
        this.echarts = new echarts.init(dom);
    }

    Echarts.prototype.show = function() {
        this.echarts.clear();
        this.echarts.setOption(this.option);
    }

    /*
        REFRESH: 'refresh',
        RESTORE: 'restore',
        RESIZE: 'resize',
        CLICK: 'click',
        HOVER: 'hover',
        MOUSEWHEEL: 'mousewheel',
        // -------业务交互逻辑
        DATA_CHANGED: 'dataChanged',
        DATA_ZOOM: 'dataZoom',
        DATA_RANGE: 'dataRange',
        LEGEND_SELECTED: 'legendSelected',
        MAP_SELECTED: 'mapSelected',
        PIE_SELECTED: 'pieSelected',
        MAGIC_TYPE_CHANGED: 'magicTypeChanged',
        DATA_VIEW_CHANGED: 'dataViewChanged',
        MAP_ROAM : 'mapRoam',
    */
    Echarts.prototype.on = function(eventName, fn) {
        this.echarts.on(ecConfig.EVENT[eventName], fn);
    }

    return Echarts;

})