define([
    'jquery',
    'underscore',
    'backbone',
    'views/demos/DemoLeftSideView',
    'views/demos/Demo2RightSideView',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone, DemoLeftSideView, Demo2RightSideView, templateHtml) {
    var Demo2PageView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.$el.html(this.template({}));
            this.args = args;
        },
        render: function () {
            new DemoLeftSideView({el: $('#leftContainer'), expanded: '#demo2Narrative'});
            new Demo2RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
        }
    });
    return Demo2PageView;
});
