define([
    'jquery',
    'underscore',
    'backbone',
    'views/demos/DemoLeftSideView',
    'views/demos/Demo3RightSideView',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone, DemoLeftSideView, Demo3RightSideView, templateHtml) {
    var Demo3PageView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.$el.html(this.template({}));
            this.args = args;
        },
        render: function () {
            new DemoLeftSideView({el: $('#leftContainer'), expanded: '#demo3Narrative'});
            new Demo3RightSideView({el: $('#rightContainer'), mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
        }
    });
    return Demo3PageView;
});
