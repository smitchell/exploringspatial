define([
    'jquery',
    'underscore',
    'backbone',
    'leaflet',
    'text!demos/demo3/templates/RightSideView.html'
], function ($, _, Backbone, L, templateHtml) {
    var RightSideView = Backbone.View.extend({
        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.args = args;
            this.render();
        },
        render: function () {
            this.$el.html(this.template({mapWidth: this.args.mapWidth, mapHeight: this.args.mapHeight}));
        }
    });
    return RightSideView;
});
