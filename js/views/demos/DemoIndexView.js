define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/demos/DemoIndexView.html'
], function ($, _, Backbone, templateHtml) {
    var DemoIndexView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.render();
        },
        render: function () {
            this.$el.html(this.template({}));
        }

    });
    return DemoIndexView;
});
