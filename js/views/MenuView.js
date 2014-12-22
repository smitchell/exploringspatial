define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/MenuView.html'
], function ($, _, Backbone, templateHtml) {
    var MenuView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            this.$el.html(this.template({}));


        },
        changeMenu: function(route) {
            this.$('.home').removeClass('YouAreHere');
            this.$('.about').removeClass('YouAreHere');
            this.$('.demos').removeClass('YouAreHere');
            if (route == 'home') {
                this.$('.home').addClass('YouAreHere');
            } else if (route == 'about') {
                this.$('.about').addClass('YouAreHere');
            } else if (route == 'demos') {
                this.$('.demos').addClass('YouAreHere');
            }
        }
    });
    return MenuView;
});
