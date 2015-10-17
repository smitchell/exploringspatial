define([
    'jquery',
    'underscore',
    'backbone',
    'views/about/AboutLeftSideView',
    'views/about/AboutRightSideView',
    'text!templates/about/AboutPageView.html'
], function ($, _, Backbone, AboutLeftSideView, AboutRightSideView, templateHtml) {
    var AboutPageView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
        },
        render: function () {
            this.$el.html(this.template({}));
            new AboutLeftSideView({el: $('#leftContainer')});
            new AboutRightSideView({el: $('#rightContainer')});
        }
    });
    return AboutPageView;
});
