define([
    'jquery',
    'underscore',
    'backbone',
    'views/home/HomeLeftSideView',
    'views/home/HomeRightSideView',
    'text!templates/home/HomePageView.html'
], function ($, _, Backbone, HomeLeftSideView, HomeRightSideView, templateHtml) {
    var HomePageView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
        },
        render: function () {

            this.$el.html(this.template({}));
            new HomeLeftSideView({el: $('#leftContainer')});
            new HomeRightSideView({el: $('#rightContainer')});
        }
    });
    return HomePageView;
});
