define([
    'jquery',
    'underscore',
    'backbone',
    'demos/demo1/views/DemoPageView',
    'demos/demo2/views/DemoPageView',
    'demos/demo3/views/DemoPageView',
    'demos/demo4/views/DemoPageView',
    'demos/demo5/views/DemoPageView',
    'demos/demo6/views/DemoPageView',
    'demos/demo7/views/DemoPageView',
    'demos/demo8/views/DemoPageView',
    'demos/demo9/views/DemoPageView',
    'utils/StyleManager',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone,
             Demo1PageView, 
             Demo2PageView, 
             Demo3PageView, 
             Demo4PageView, 
             Demo5PageView, 
             Demo6PageView, 
             Demo7PageView,
             Demo8PageView,
             Demo9PageView,
             StyleManager,
             templateHtml) {
    var DemoPageView = Backbone.View.extend({

        initialize: function (args, demoId) {
            this.args = args;
            this.template = _.template(templateHtml);
            var _this = this;
            $(window).resize (function() {
                _this.resizeDemo();
            });
        },

        render: function (demoId) {
            var styleManager = new StyleManager();
            styleManager.addDemoStyleSheet(demoId);
            this.$el.html(this.template({}));
            var $demoTitle = this.$('#demoTitle');
            $demoContainer = $('#container3');
            this.destroyCurrentView();
            switch(Number(demoId)) {
                case 1:
                    $demoTitle.html('Bing and Google Map Plugins');
                    this.currentDemo = new Demo1PageView({el: $demoContainer});

                    break;
                case 2:
                    $demoTitle.html('Earthquake Data on ArcGIS Online');
                    this.currentDemo = new Demo2PageView({el: $demoContainer});
                    break;
                case 3:
                    $demoTitle.html('Earthquake Data on Mapbox');
                    this.currentDemo = new Demo3PageView({el: $demoContainer});
                    break;
                case 4:
                    $demoTitle.html('Garmin-styled Map with Leaflet');
                    this.currentDemo = new Demo4PageView({el: $demoContainer});
                    break;
                case 5:
                    $demoTitle.html('Electronic Running Log in GeoJSON Format');
                    this.currentDemo = new Demo5PageView({el: $demoContainer});
                    break;
                case 6:
                    $demoTitle.html('Armed Conflict in Africa: 1971 - 2014');
                    this.currentDemo = new Demo6PageView({el: $demoContainer});
                    break;
                case 7:
                    $demoTitle.html('Leaflet-PIP Example');
                    this.currentDemo = new Demo7PageView({el: $demoContainer});
                    break;
                case 8:
                    $demoTitle.html('50-state Marathon Club Map With Leaflet-PIP');
                    this.currentDemo = new Demo8PageView({el: $demoContainer});
                    break;
                default: {
                    demoId = 9;
                    $demoTitle.html('Geofencing With Leaflet-PIP');
                    this.currentDemo = new Demo9PageView({el: $demoContainer});
                    break;
                }
            }
        },

        destroyCurrentView: function() {
            if (this.currentDemo) {

                // COMPLETELY UNBIND THE VIEW
                this.currentDemo.undelegateEvents();

                this.currentDemo.$el.removeData().unbind();

                // Remove view from DOM
                this.currentDemo.remove();
                Backbone.View.prototype.remove.call(this.currentDemo);

            }
        },

        resizeDemo: function() {
            if (this.currentDemo) {
                this.currentDemo.sizeMaps();
            }
        }
    });
    return DemoPageView;
});
