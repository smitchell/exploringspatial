define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/about/AboutLeftSideView.html'
], function ($, _, Backbone, templateHtml) {
    var AboutLeftSideView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            this.$el.html(this.template({}));
        }
    });
    return AboutLeftSideView;
});