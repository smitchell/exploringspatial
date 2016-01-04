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
            this.dispatcher.on(this.dispatcher.Events.LINE_CHANGED, this.onLineChanged, this);
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
                       // Magic number... if length is two "presumes" directions have not been fetched yet.
                       // (we don't want to call directions for every line segement each time the route gets extended.
                       // The line must be set back to two points to force directions to be called again.
                       snapToRoads: _this.snapToRoads && lineString.length === 2,
                       dispatcher: _this.dispatcher
                   });
               });
            }
        },

        onLineChanged: function(event) {
            var lineStrings = this.model.get('coordinates');
            var lineString = event.line.get('lineString');
            var lineIndex = event.line.get('lineIndex');
            lineStrings[lineIndex] = lineString;
            if (lineIndex > 0) {
                var previousLine = lineStrings[lineIndex - 1];
                // set last point of previous line to first point of changed line
                previousLine[previousLine.length - 1] = lineString[0];
            }
            if (lineIndex <  lineStrings.length - 1) {
                var nextLine = lineStrings[lineIndex + 1];
                // set first point of next line to last point of changed line
                nextLine[0] = lineString[lineString.length - 1];
            }
            this.model.set({'coordinates': lineStrings});
            this.model.trigger('change:coordinates');
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
