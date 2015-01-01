define([
    'underscore',
    'backbone',
    'text!templates/maps/MapZoomControlsView.html',
    'leaflet'
], function(_, Backbone, templateHtml) {

    var MapZoomControlsView = Backbone.View.extend({

        events: {
            'click .map-zoom-in' : 'onZoomIn',
            'click .map-zoom-out' : 'onZoomOut'
        },

        initialize: function(args) {
            this.map = args.map;
            this.template = _.template(templateHtml);
            this.render();
        },

        render: function() {
            var html = this.template();
            jQuery(this.el).html(html);
        },

        onZoomIn: function(e) {
            e.preventDefault();
            this.map.zoomIn(1);
        },

        onZoomOut: function(e) {
            e.preventDefault();
            this.map.zoomOut(1);
        }

    });

    return MapZoomControlsView;
});
