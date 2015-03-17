define(function (require, exports, module) {
    var $ = require('jquery');
    require('plugin/select');
    require('plugin/validator');
    require('plugin/jquery.cookie.js');
    require('plugin/slide');
    require('plugin/calendar');
    require('plugin/paging');
    require('plugin/popup');

    $('.slide').Slide();

    $('.input-date').Calendar();

    $('.js-select').Select({
        appendClass : 'inline-block middle',
        height : '24px'
    });

    $("#form").Validator();
    $("#form1").Validator();

    $("#form").on('validatorBefore',function(){
        //alert('这是验证前的方法');
    })
    $("#form").on('submitBefore',function(){
        //alert('这是提交前的方法');
    })
    $("#form").on('submitSuccess',function( e, data ){

    })
    $("#form").on('submitError',function(){
        
    })


    $("#paging").Paging({
        total : 100,
        afterRender : function(num) {
        }
    })
    $.showPopup({
        isHeader : false,
        content : "<br><br><br><br><br><br><br><br><br><br><br><br><br><br>"
    });
});