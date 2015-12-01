define([
    'jquery'
], function ($) {
    "use strict";

    function StyleManager() {

    }

    StyleManager.prototype = {
        baseUrl: "js/demos/",

        cssPath: "/css/demo.css",

        removeDemoStyleSheet: function() {
            $('#demoCss').remove();
        },

        addDemoStyleSheet: function(demoName) {
            var url = this.baseUrl + demoName + this.cssPath;
            $('head').append('<link href="' + url + '" rel="stylesheet" id="demoCss" />');
        }
    };

    return  StyleManager;
    });