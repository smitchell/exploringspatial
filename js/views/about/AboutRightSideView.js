define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/about/AboutRightSideView.html'
], function ($, _, Backbone, templateHtml) {
    var AboutRightSideView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            this.$el.html(this.template({}));
        }
    });
    return AboutRightSideView;
});