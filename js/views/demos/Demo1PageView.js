define([
    'jquery',
    'underscore',
    'backbone',
    'views/demos/DemoLeftSideView',
    'views/demos/Demo1RightSideView',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone, DemoLeftSideView, Demo1RightSideView, templateHtml) {
    var Demo1PageView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.$el.html(this.template({}));
            this.args = args;
        },
        render: function () {
            new DemoLeftSideView({el: $('#leftContainer'), expanded: '#demo1Narrative'});
            new Demo1RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
        }
    });
    return Demo1PageView;
});
