define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Demos',
    'views/demos/DemoDescriptionView',
    'text!templates/demos/DemoPageView.html',
    'domReady!'
], function ($, _, Backbone,
             Demos,
             DemoDescriptionView,
             templateHtml) {
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
            var _this = this;
            $(window).resize (function () {
                _this.resizeDemo();
                _this.resizeOverlay();
            });
        },

        loadData: function(demoId) {
            var _this = this;
            this.collection = new Demos();
            this.collection.fetch({
                success: function() {
                    _this.render(demoId);
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        } ,

        render: function (demoId) {
            var _this = this;
            if (demoId == 'current') {
                demoId = this.collection.length;
            }
            var numericId = Number(demoId);
            if (isNaN(numericId)) {
                throw new Error('DemoPageView.render() -- demoId isNaN ' + demoId);
            }
            demoId = numericId;
            this.currentDemolView = "demo" + demoId;
            this.demoModel = null;
            // Look for a demo description matching the demoId.
            this.collection.each(function (demo) {
                if (demoId === demo.get('demoId')) {
                    _this.demoModel = demo;
                }
            });

            // If none is found, then default to the last demo definition in the collection.
            if (this.demoModel == null) {
                throw new Error('Demo Json not found for Demo ID: ' + demoId);
            }
            this.destroyCurrentView();
            this.$el.html(this.template({}));
            this.$('#demoTitle').html(_this.demoModel.get('title'));
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
            var currentDemo = this.router.modules[this.currentDemolView];
            if (typeof currentDemo == 'undefined') {
                this.router.modules[this.currentDemolView] = 'loading';
                require([this.demoModel.get('view')], function (demoPageView) {
                    currentDemo = new demoPageView({el: '#demoBody'});
                    _this.router.modules[_this.currentDemolView] = currentDemo;
                    currentDemo.render();
                });
            } else if (currentDemo != 'loading') {
                currentDemo.render();
            }
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
                    top: ($demoContainer.offset().top * 1.25) + 'px',
                    left: (width * 0.3) + 'px',
                    width: (width * 0.50) + 'px'
                });
            }
        },

        destroyCurrentView: function () {
            if (this.router.modules[this.currentDemolView]) {
                if (this.demoDescriptionView) {
                    this.demoDescriptionView.destroy();
                    this.demoDescriptionView = null;
                }
                // COMPLETELY UNBIND THE VIEW
                this.router.modules[this.currentDemolView].undelegateEvents();

                this.router.modules[this.currentDemolView].$el.removeData().unbind();

                if (this.router.modules[this.currentDemolView].destroy) {
                    this.router.modules[this.currentDemolView].destroy();
                }
                Backbone.View.prototype.remove.call(this.router.modules[this.currentDemolView]);

            }
        },

        resizeDemo: function () {
            var currentDemo = this.router.modules[this.currentDemolView];
            if (typeof currentDemo != 'undefined' && currentDemo != 'loading' && currentDemo.sizeMaps) {
                var width = $('window').width();
                var buttons = $('.demoBanner ul');
                $('demoHeader').css({width: (width - buttons.width()) + 'px'});
                currentDemo.sizeMaps();
            }
        },

        prev: function (event) {
            event.preventDefault();
            var currentDemo = this.router.modules[this.currentDemolView];
            if (typeof currentDemo != 'undefined' && currentDemo != 'loading') {
                var demoId = currentDemo.getDemoId() - 1;
                if (demoId >= 1) {
                    this.render(demoId);
                    this.router.navigate("demo/" + demoId);
                }
            }
        },

        next: function (event) {
            event.preventDefault();
            var currentDemo = this.router.modules[this.currentDemolView];
            if (typeof currentDemo != 'undefined' && currentDemo != 'loading') {
                var demoId = currentDemo.getDemoId() + 1;
                if (demoId <= this.collection.length) {
                    this.render(demoId);
                    this.router.navigate("demo/" + demoId);
                }
            }
        }
    });
    return DemoPageView;
});
