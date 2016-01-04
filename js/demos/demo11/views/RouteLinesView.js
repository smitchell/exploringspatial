"use strict";
define([
    'jquery',
    'backbone',
    'leaflet',
    'models/Line',
    'demos/demo11/views/RouteLineView'
], function ($, Backbone, L, Line, RouteLineView) {
    var RouteLinesView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.snapToRoads = args.snapToRoads;
            this.dispatcher = args.dispatcher;
            this.listenTo(this.model, 'change:coordinates', this.render);
            this.lineViews = [];
            this.dispatcher.on(this.dispatcher.Events.CHANGE_SNAP_TO_ROAD, this.onChangeSnapToRoads, this);
            this.linesGroup = L.featureGroup().addTo(this.map);
        },


        render: function () {
            this.clearLines();

           if (this.model.get('type') === 'MultiLineString') {
                var lineStrings = this.model.get('coordinates');
               var _this = this;
               $.each(lineStrings, function(i, lineString) {
                   _this.lineViews[i] = new RouteLineView({
                       map: _this.map,
                       model: new Line({
                           lineIndex: i,
                           lineString: lineString
                       }),
                       linesGroup: _this.linesGroup,
                       snapToRoads: _this.snapToRoads,
                       dispatcher: _this.dispatcher
                   });
               });
            }
        },

        onChangeSnapToRoads: function(args) {
            $.each(this.lineViews, function(i, lineView){
                lineView.snapToRoads = args.snapToRoads;
            });
        },


        clearLines: function () {
            if (this.linesGroup) {
                this.linesGroup.clearLayers();
            }
        },

        destroy: function () {
            if (this.linesGroup) {
                this.map.removeLayer(this.linesGroup);
            }
            // Remove view from DOM
            this.remove();
        }
    });

    return RouteLinesView;
});
