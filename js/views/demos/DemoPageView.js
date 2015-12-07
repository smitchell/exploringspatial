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
    'collections/Demos',
    'utils/StyleManager',
    'views/demos/DemoDescriptionView',
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
             Demos,
             StyleManager,
             DemoDescriptionView,
             templateHtml) {
    var DemoPageView = Backbone.View.extend({
        styleManager: new StyleManager(),

        events: {
            'click .left': 'prev',
            'click .right': 'next',
            'click .info' : 'openOverlay'
        },

        initialize: function (args) {
            if (!args) {
                throw new Error('args required');
            }
            if (!args.router) {
                throw new Error('args.router is required');
            }
            this.router = args.router;
            this.initialLoad = true;
            this.template = _.template(templateHtml);
            var _this = this;
            this.collection = new Demos();
            this.demoPageView = [
            Demo1PageView,
            Demo2PageView,
            Demo3PageView,
            Demo4PageView,
            Demo5PageView,
            Demo6PageView,
            Demo7PageView,
            Demo8PageView,
            Demo9PageView];
            $(window).resize (function() {
                _this.resizeDemo();
                _this.resizeOverlay();
            });
           this.collection.fetch({
               success: function() {
                   if (args.demoId) {
                       _this.render(args.demoId)
                   }
               },
               error: function(error, a ,b , c) {
                   console.log(error);
               }
           });
        },

        render: function (demoId) {
            this.styleManager.addDemoStyleSheet(demoId);
            this.$el.html(this.template({}));
            var $demoTitle = this.$('#demoTitle');
            $demoContainer = $('#demoBody');
            this.destroyCurrentView();
            if (demoId <= 1) {
                this.$('.left').hide();
            } else {
                this.$('.left').show();
            }
            if (demoId >= this.collection.length) {
                this.$('.right').hide();
            } else {
                this.$('.right').show();
            }
            var _this = this;
            this.demo = null;

            // Look for a demo descripiton matching the demoId.
            this.collection.each(function(demo) {
                if (demoId == demo.get('demoId')) {
                    $demoTitle.html(demo.get('title'));
                    _this.demo = demo;
                }
            });

            // If none is found, then default to the last demo definition in the collection.
            if (this.demo == null) {
                this.demo = this.collection.models[this.collection.length - 1];
                demoId =  this.demo.get('demoId');
            }

            // Load the DemoPageView corresponding to the demo definition.
            this.currentDemo = null;
            $.each(this.demoPageView, function(index, demoPageView) {
                if (demoPageView.DEMO_ID == demoId) {
                    $demoTitle.html(_this.demo.get('title'));
                    _this.currentDemo = new demoPageView({el: $demoContainer});
                }
            });
            //switch(Number(demoId)) {
            //    case 1:
            //        $demoTitle.html('Bing and Google Map Plugins');
            //        this.currentDemo = new Demo1PageView({el: $demoContainer});
            //
            //        break;
            //    case 2:
            //        $demoTitle.html('Earthquake Data on ArcGIS Online');
            //        this.currentDemo = new Demo2PageView({el: $demoContainer});
            //        break;
            //    case 3:
            //        $demoTitle.html('Earthquake Data on Mapbox');
            //        this.currentDemo = new Demo3PageView({el: $demoContainer});
            //        break;
            //    case 4:
            //        $demoTitle.html('Garmin-styled Map with Leaflet');
            //        this.currentDemo = new Demo4PageView({el: $demoContainer});
            //        break;
            //    case 5:
            //        $demoTitle.html('Electronic Running Log in GeoJSON Format');
            //        this.currentDemo = new Demo5PageView({el: $demoContainer});
            //        break;
            //    case 6:
            //        $demoTitle.html('Armed Conflict in Africa: 1971 - 2014');
            //        this.currentDemo = new Demo6PageView({el: $demoContainer});
            //        break;
            //    case 7:
            //        $demoTitle.html('Leaflet-PIP Example');
            //        this.currentDemo = new Demo7PageView({el: $demoContainer});
            //        break;
            //    case 8:
            //        $demoTitle.html('50-state Marathon Club Map With Leaflet-PIP');
            //        this.currentDemo = new Demo8PageView({el: $demoContainer});
            //        break;
            //    default: {
            //        demoId = this.collection.length;
            //        $demoTitle.html('Geofencing With Leaflet-PIP');
            //        this.currentDemo = new Demo9PageView({el: $demoContainer});
            //        break;
            //    }
            //}
            if (this.initialLoad) {
                this.openOverlay();
                this.initialLoad = false;
            }
        },

        openOverlay: function(event) {
            if (event) {
                event.preventDefault();
            }
            var overlay = $('.overlay');
            if (overlay.length > 0) {
                if (this.demoDescriptionView) {
                    this.demoDescriptionView.destroy();
                }
            } else {
                this.demoDescriptionView = new DemoDescriptionView({demoId: this.currentDemo.DEMO_ID});
                this.resizeOverlay();
            }
        },

        resizeOverlay: function() {
            var overlay = $('.overlay');
            if (overlay) {
                var $demoContainer = $('#demoBody');
                var width = $demoContainer.width();
                overlay.css({
                    top: ($demoContainer.offset().top * 1.25) + 'px',
                    left: (width * 0.15) + 'px',
                    height: ($demoContainer.height() * 0.8) + 'px',
                    width: (width * 0.80) + 'px'
                });
            }
        },

        destroyCurrentView: function() {
            event.preventDefault();
            if (this.currentDemo) {
                if (this.demoDescriptionView) {
                    this.demoDescriptionView.destroy();
                    this.demoDescriptionView = null;
                }
                // COMPLETELY UNBIND THE VIEW
                this.currentDemo.undelegateEvents();

                this.currentDemo.$el.removeData().unbind();

                if(this.currentDemo.destroy) {
                    this.currentDemo.destroy();
                }
                Backbone.View.prototype.remove.call(this.currentDemo);

            }
        },

        resizeDemo: function() {
            var width = $('window').width();
            var buttons = $('.demoBanner ul');
            $('demoHeader').css({width: (width - buttons.width()) + 'px'});
            if (this.currentDemo) {
                this.currentDemo.sizeMaps();
            }
        },

        prev: function(event) {
            event.preventDefault();
            var demoId = this.currentDemo.getDemoId() - 1;
            if (demoId >= 1) {
                this.router.navigate("demo/" + demoId);
                this.render(demoId);
            }
        },

        next: function(event) {
            event.preventDefault();
            var demoId = this.currentDemo.getDemoId() + 1;
            if (demoId <= this.collection.length) {
                this.router.navigate("demo/" + demoId);
                this.render(demoId);
            }
        }
    });
    return DemoPageView;
});
