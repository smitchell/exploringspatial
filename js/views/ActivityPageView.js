define([
    'jquery',
    'underscore',
    'backbone',
    'views/ActivityRightSideView',
    'text!templates/demos/DemoPageView.html'
], function ($, _, Backbone, ActivityRightSideView, templateHtml) {
    var ActivityPageView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.$el.html(this.template({}));
            this.args = args;
        },
        render: function (activityId) {
            new ActivityRightSideView({el: $('#rightContainer'), activityId: activityId, mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight});
        }
    });
    return ActivityPageView;
});
