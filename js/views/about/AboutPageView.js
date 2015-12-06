define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/about/AboutPageView.html'
], function ($, _, Backbone, templateHtml) {
    var AboutPageView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
        },
        render: function () {
            this.$el.html(this.template({}));
            gapi.follow.go("googlefollow");
        }
    });
    return AboutPageView;
});
