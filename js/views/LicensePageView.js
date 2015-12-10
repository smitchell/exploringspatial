define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/LicenseView.html',
    'domReady!'
], function ($, _, Backbone, templateHtml) {
    var LicensePageView = Backbone.View.extend({
        initialize: function () {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            this.$el.html(this.template());
        }
    });
    return LicensePageView;
});