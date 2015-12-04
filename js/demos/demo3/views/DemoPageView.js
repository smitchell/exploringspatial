define([
    'jquery',
    'underscore',
    'backbone',
    'text!demos/demo3/templates/DemoPageView.html'
], function ($, _, Backbone, templateHtml) {
    var DemoPageView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },

        render: function () {
            var $window = $( window );
            var width = $window.width() - 100;
            var height = $window.height() - 220;
            this.$el.html(this.template({mapHeight: height, mapWidth: width}));
            var s = "http://a.tiles.mapbox.com/v3/runner-steve.tillmill-tutorial.html";
            var iframe1 = document.getElementById('iframe1');
            if ( -1 == navigator.userAgent.indexOf("MSIE") ) {
              iframe1.src = s;
            }
            else {
              iframe1.location = s;
            }
        },

        sizeMaps: function() {
            //no op
        }
    });
    return DemoPageView;
});
