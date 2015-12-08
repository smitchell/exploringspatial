define([
    'jquery'
], function ($) {
    "use strict";

    function StyleManager() {

    }

    StyleManager.prototype = {
        maxDemo: 9,
        baseUrl: "js/demos/demo",

        cssPath: "/css/demo.css",

        addDemoStyleSheet: function(demoId) {
            var isMissing = true;
            for(var i = 1; i <= this.maxDemo; i++) {
                var styleSheet = $('#demo' + i);
                if (styleSheet.length > 0 ) {
                    if (i === demoId) {
                        isMissing = true;
                    } else {
                        styleSheet.remove();
                    }
                }
            }
            if (isMissing) {
                var url = this.baseUrl + demoId + this.cssPath;
                $('head').append('<link href="' + url + '" rel="stylesheet" id="demo' + demoId + '" />');
            }
        }
    };

    return  StyleManager;
    });