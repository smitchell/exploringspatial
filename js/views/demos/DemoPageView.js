define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Demos',
    'views/demos/DemoDescriptionView',
    'demos/demo1/views/Demo1PageView',
    'demos/demo2/views/Demo2PageView',
    'demos/demo3/views/Demo3PageView',
    'demos/demo4/views/Demo4PageView',
    'demos/demo5/views/Demo5PageView',
    'demos/demo6/views/Demo6PageView',
    'demos/demo7/views/Demo7PageView',
    'demos/demo8/views/Demo8PageView',
    'demos/demo9/views/Demo9PageView',
    'demos/demo10/views/Demo10PageView',
    'demos/demo11/views/Demo11PageView',
    'text!templates/demos/DemoPageView.html',
    'domReady!'
], function ($, _, Backbone,
             Demos,
             DemoDescriptionView,
             Demo1PageView,
             Demo2PageView,
             Demo3PageView,
             Demo4PageView,
             Demo5PageView,
             Demo6PageView,
             Demo7PageView,
             Demo8PageView,
             Demo9PageView,
             Demo10PageView,
             Demo11PageView,
             templateHtml
             ) {
    var DemoPageView = Backbone.View.extend({

        events: {
            'click .left': 'prev',
            'click .right': 'next',
            'click .info': 'openOverlay'
        },

        initialize: function (args) {
            if (!args) {
                throw new Error('args required');
            }
            if (!args.router) {
                throw new Error('args.router is required');
            }
            this.router = args.router;
            this.template = _.template(templateHtml);
            this.initialLoad = true;
            var self = this;
            $(window).resize (function () {
                self.resizeDemo();
                self.resizeOverlay();
            });
        },

        loadData: function(demoId) {
            var self = this;
            this.collection = new Demos();
            this.collection.fetch({
                success: function() {
                    self.render(demoId);
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        } ,

        render: function (demoId) {
            var self = this;
            if (demoId == 'current') {
                demoId = this.collection.length;
            }
            var numericId = Number(demoId);
            if (isNaN(numericId)) {
                throw new Error('DemoPageView.render() -- demoId isNaN ' + demoId);
            }
            demoId = numericId;
            this.demoModel = null;
            // Look for a demo description matching the demoId.
            this.collection.each(function (demo) {
                if (demoId === demo.get('demoId')) {
                    self.demoModel = demo;
                }
            });

            // If none is found, then default to the last demo definition in the collection.
            if (this.demoModel == null) {
                throw new Error('Demo Json not found for Demo ID: ' + demoId);
            }
            this.destroyCurrentView();
            this.$el.html(this.template({}));
            this.$('#demoTitle').html(self.demoModel.get('title'));
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
            this.currentDemoView = eval("new Demo" + demoId + "PageView({el: '#demoBody'})");
            if (this.initialLoad) {
                this.openOverlay();
                this.initialLoad = false;
            }
        },

        openOverlay: function (event) {
            if (event) {
                event.preventDefault();
            }
            var overlay = $('.overlay');
            if (overlay.length > 0) {
                if (this.demoDescriptionView) {
                    this.demoDescriptionView.destroy();
                }
            } else {
                this.demoDescriptionView = new DemoDescriptionView({model: this.demoModel});
                this.resizeOverlay();
            }
        },

        resizeOverlay: function () {
            var overlay = $('.overlay');
            if (overlay) {
                var $demoContainer = $('#demoBody');
                var width = $demoContainer.width();
                overlay.css({
                    top: ($demoContainer.offset().top * 1.8) + 'px',
                    left: (width * 0.3) + 'px',
                    width: (width * 0.50) + 'px'
                });
            }
        },

        destroyCurrentView: function () {
            if (this.currentDemoView) {
                if (this.demoDescriptionView) {
                    this.demoDescriptionView.destroy();
                    this.demoDescriptionView = null;
                }
                // COMPLETELY UNBIND THE VIEW
                this.currentDemoView.undelegateEvents();

                this.currentDemoView.$el.removeData().unbind();

                if (this.currentDemoView.destroy) {
                    this.currentDemoView.destroy();
                }
                Backbone.View.prototype.remove.call(this.currentDemoView);

            }
        },

        resizeDemo: function () {
            if (typeof this.currentDemoView != 'undefined' && this.currentDemoView.sizeMaps) {
                var width = $('window').width();
                var buttons = $('.demoBanner ul');
                $('demoHeader').css({width: (width - buttons.width()) + 'px'});
                this.currentDemoView.sizeMaps();
            }
        },

        prev: function (event) {
            event.preventDefault();
            if (typeof this.currentDemoView != 'undefined' &&  this.currentDemoView.getDemoId() > 1) {
                var prevDemo;
                var baseZeroIndex = this.currentDemoView.getDemoId() - 2;
                if (baseZeroIndex >= 0) {
                    prevDemo = this.collection.at(baseZeroIndex--);
                    while (prevDemo.get('status') != 'Published' && baseZeroIndex >= 0) {
                        prevDemo = this.collection.at(baseZeroIndex--);
                    }
                    var demoId = prevDemo.get('demoId');
                    this.render(demoId);
                    this.router.navigate("demo/" + demoId);
                }
            }
        },

        next: function (event) {
            event.preventDefault();
            if (typeof this.currentDemoView != 'undefined' && this.currentDemoView.getDemoId() < this.collection.length) {
                var nextDemo;
                var baseZeroIndex = this.currentDemoView.getDemoId();
                if (baseZeroIndex < this.collection.length) {
                    nextDemo = this.collection.at(baseZeroIndex++);
                    while (nextDemo.get('status') != 'Published' && baseZeroIndex < this.collection.length) {
                        nextDemo = this.collection.at(baseZeroIndex++);
                    }
                    var demoId = nextDemo.get('demoId');
                    this.render(demoId);
                    this.router.navigate("demo/" + demoId);
                }
            }
        }
    });
    return DemoPageView;
});
