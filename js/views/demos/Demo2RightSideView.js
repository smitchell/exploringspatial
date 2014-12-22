define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/demos/Demo2RightSideView.html'
], function ($, _, Backbone, templateHtml) {
    var Demo2RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.render();
        },
        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
        }
    });
    return Demo2RightSideView;
});
