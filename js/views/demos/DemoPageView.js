define([
    'jquery',
    'underscore',
    'backbone',
    'collections/Demos',
    'views/demos/DemoDescriptionView',
    'text!templates/demos/DemoPageView.html'
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
            this.initialLoad = true;
            this.template = _.template(templateHtml);
            var _this = this;
            this.collection = new Demos();
            $(window).resize (function () {
                _this.resizeDemo();
                _this.resizeOverlay();
            });
            this.collection.fetch({
                success: function (collection, xhr, options) {
                    _this.render(args.demoId)
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        render: function (demoId) {
            var _this = this;
            switch (demoId) {
                case 1:
                {
                    require(['demos/demo1/views/DemoPageView'], function (Demo1PageView) {
                        _this.onLoadComplete(demoId, Demo1PageView);
                    });
                    break;
                }
                case 2:
                {
                    require(['demos/demo2/views/DemoPageView'], function (Demo2PageView) {
                        _this.onLoadComplete(demoId, Demo2PageView);
                    });
                    break;
                }
                case 3:
                {
                    require(['demos/demo3/views/DemoPageView'], function (Demo3PageView) {
                        _this.onLoadComplete(demoId, Demo3PageView);
                    });
                    break;
                }
                case 4:
                {
                    require(['demos/demo4/views/DemoPageView'], function (Demo4PageView) {
                        _this.onLoadComplete(demoId, Demo4PageView);
                    });
                    break;
                }
                case 5:
                {
                    require(['demos/demo5/views/DemoPageView'], function (Demo5PageView) {
                        _this.onLoadComplete(demoId, Demo5PageView);
                    });
                    break;
                }
                case 6:
                {
                    require(['demos/demo6/views/DemoPageView'], function (Demo6PageView) {
                        _this.onLoadComplete(demoId, Demo6PageView);
                    });
                    break;
                }
                case 7:
                {
                    require(['demos/demo7/views/DemoPageView'], function (Demo7PageView) {
                        _this.onLoadComplete(demoId, Demo7PageView);
                    });
                    break;
                }
                case 8:
                {
                    require(['demos/demo8/views/DemoPageView'], function (Demo8PageView) {
                        _this.onLoadComplete(demoId, Demo8PageView);
                    });
                    break;
                }
                default:
                {
                    require(['demos/demo9/views/DemoPageView'], function (Demo9PageView) {
                        _this.onLoadComplete(demoId, Demo9PageView);
                    });
                    break;
                }
            }
        },

        onLoadComplete: function (demoId, demoPageView) {
            this.destroyCurrentView();
            this.$el.html(this.template({}));

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
            this.demoModel = null;
            // Look for a demo descripiton matching the demoId.
            this.collection.each(function (demo) {
                if (demoId === demo.get('demoId')) {
                    _this.demoModel = demo;
                }
            });

            // If none is found, then default to the last demo definition in the collection.
            if (this.demoModel == null) {
                this.demoModel = this.collection.models[this.collection.length - 1];
                demoId = this.demoModel.get('demoId');
            }

            this.currentDemolView = new demoPageView({el: $('#demoBody')});
            this.$('#demoTitle').html(_this.demoModel.get('title'));

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
            if (this.currentDemolView) {
                if (this.demoDescriptionView) {
                    this.demoDescriptionView.destroy();
                    this.demoDescriptionView = null;
                }
                // COMPLETELY UNBIND THE VIEW
                this.currentDemolView.undelegateEvents();

                this.currentDemolView.$el.removeData().unbind();

                if (this.currentDemolView.destroy) {
                    this.currentDemolView.destroy();
                }
                Backbone.View.prototype.remove.call(this.currentDemolView);

            }
        },

        resizeDemo: function () {
            var width = $('window').width();
            var buttons = $('.demoBanner ul');
            $('demoHeader').css({width: (width - buttons.width()) + 'px'});
            if (this.currentDemolView) {
                this.currentDemolView.sizeMaps();
            }
        },

        prev: function (event) {
            event.preventDefault();
            var demoId = this.currentDemolView.getDemoId() - 1;
            if (demoId >= 1) {
                this.router.navigate("demo/" + demoId);
                this.render(demoId);
            }
        },

        next: function (event) {
            event.preventDefault();
            var demoId = this.currentDemolView.getDemoId() + 1;
            if (demoId <= this.collection.length) {
                this.router.navigate("demo/" + demoId);
                this.render(demoId);
            }
        }
    });
    return DemoPageView;
});
