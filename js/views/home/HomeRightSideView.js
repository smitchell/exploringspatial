define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/home/HomeRightSideView.html'
], function ($, _, Backbone, templateHtml) {
    var HomeRightSideView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            this.$el.html(this.template({}));
        }
    });
    return HomeRightSideView;
});
