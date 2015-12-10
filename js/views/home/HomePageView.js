define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/home/HomePageView.html',
    'domReady!'
], function ($, _, Backbone, templateHtml) {
    var HomePageView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
        },
        render: function () {
            this.$el.html(this.template({}));
        }
    });
    return HomePageView;
});
