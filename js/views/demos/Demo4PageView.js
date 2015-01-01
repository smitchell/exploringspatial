define([
    'jquery',
    'underscore',
    'backbone',
    'views/demos/DemoLeftSideView',
    'views/demos/Demo4RightSideView',
    'views/maps/MapZoomControlsView',
    'views/maps/MapProviderControlsView',
    'views/maps/MapTypeControlsView',
    'views/maps/MapOverlayControlsView',
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