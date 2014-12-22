define([
    'jquery',
    'underscore',
    'backbone',
    'views/demos/DemoLeftSideView',
    'views/demos/demo4/Demo4RightSideView',
    'views/demos/demo4/MapZoomControlsView',
    'views/demos/demo4/MapProviderControlsView',
    'views/demos/demo4/MapTypeControlsView',
    'views/demos/demo4/MapOverlayControlsView',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone, DemoLeftSideView, Demo4RightSideView, MapZoomControlsView, MapProviderControlsView, MapTypeControlsView, MapOverlayControlsView, templateHtml) {
    var Demo4PageView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.$el.html(this.template({}));
            this.args = args;
        },
        render: function () {
            new DemoLeftSideView({el: $('#leftContainer'), expanded: '#demo4Narrative'});
            new Demo4RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});

        }
    });
    return Demo4PageView;
});
