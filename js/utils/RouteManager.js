"use strict";
/**
 * Route Manager manages route create/edit operations
 *
 */
define(function (require) {
    var $ = require('jquery');
    var L = require('leaflet');

    var RouteManager = function (args) {
        this.initialize(args);
    };

    RouteManager.prototype.initialize = function (args) {

    };

    RouteManager.prototype.deleteMarker = function (args) {
        var lineIndex = args.lineIndex;
        var pointIndex = args.pointIndex;
        var geometry = args.geometry;

        var coordinates, lineStrings;
        if (geometry.get('type') === 'MultiLineString') {
            var type = 'MultiLineString';
            lineStrings = geometry.get('coordinates'); // Array of line strings
            var newLineStrings = [];
            var nextLine, previousLine, lastPointInLine, firstPointInLine, onlyOneLineInRoute;
            $.each(lineStrings, function (i, lineString) {
                /* The points in the polyline change when Direction service is called.
                 * Setting a large value then and adjusting it here solves that problem.
                 */
                if (pointIndex > lineString.length - 1) {
                    pointIndex = lineString.length - 1;
                }
                firstPointInLine = pointIndex === 0;
                lastPointInLine = pointIndex === lineString.length - 1;
                onlyOneLineInRoute = lineStrings.length === 1;
                if (i == lineIndex) {
                    if (onlyOneLineInRoute) {
                        // Deleting the start or end of the only line in the route.
                        type = 'Point';
                        newLineStrings = lineString[pointIndex];
                    } else if (i === 0) {
                        /// Deleting start or end of first line in ourte
                        if (lastPointInLine) {
                            // combine the first line with the next line.
                            nextLine = lineStrings[i + 1];
                            lineStrings[i + 1] = [lineString[0], nextLine[nextLine.length - 1]];
                        }
                        // Nothing to do if firstPointInLine. This line will not get copied to new array.
                    } else if (i === lineStrings.length - 1) {
                        // Deleting start or end from the last line in the route
                        if (firstPointInLine) {
                            // combine the last line with the previous line.
                            // Remove the previous line from newLineStrings.
                            previousLine = newLineStrings.pop();
                            lineString = [previousLine[0], lineString[lineString.length - 1]];
                            newLineStrings.push(lineString)
                        }
                        // Nothing to do if lastPointInLine. This line will not get copied to new array.
                    } else if (i > 0 && i < lineStrings.length - 1) {
                        // combine the adjacent lines
                        // Remove the previous line from newLineStrings.
                        previousLine = newLineStrings.pop();

                        // Replace the points of the next line with starting point of the
                        // previous line and the last point of the next line. This will
                        // trigger directions to be called if snap-to-roads is enabled.
                        nextLine = lineStrings[i + 1];
                        lineStrings[i + 1] = [previousLine[0], nextLine[nextLine.length - 1]];

                    }
                } else {
                    newLineStrings.push(lineString)
                }
            });
            geometry.set({'type': type, 'coordinates': newLineStrings});


        } else {
            geometry.set({'type': '', 'coordinates': []});
        }
        geometry.trigger('change:coordinates');
    };

    RouteManager.prototype.moveMarker = function (args) {
        var geometry = args.geometry;
        var point = args.point;
        var pointIndex = args.pointIndex;
        var lineIndex = args.lineIndex;

        var lineString;
        if (geometry.get('type') === 'Point') {
            geometry.set('coordinates', point);
        } else if (geometry.get('type') === 'MultiLineString') {
            var lineStrings = geometry.get('coordinates');
            if (lineStrings.length > 0) {
                lineString = lineStrings[lineIndex];
                lineString[pointIndex] = point;
                // clear intermediate points to force directions to be refetch.
                lineStrings[lineIndex] = [lineString[0], lineString[lineString.length - 1]];
                // Adjust adjacent lines
                if (pointIndex === 0 && lineIndex > 0) {
                    var previousLine = lineStrings[lineIndex - 1];
                    previousLine[previousLine.length - 1] = lineString[pointIndex];
                } else if (pointIndex === lineString.length - 1 && lineIndex < lineStrings.length - 1) {
                    var nextLine = lineStrings[lineIndex + 1];
                    nextLine[0] = lineString[pointIndex];
                }
                geometry.set('coordinates', lineStrings);
                geometry.trigger('change:coordinates');
            }
        }
    };

    RouteManager.prototype.addPoint = function (args) {
        var geometry = args.geometry;
        var newPoint = args.point;
        var newLineString, lineStrings;

        var coordinates = geometry.get('coordinates');
        if (geometry.get('type') === 'MultiLineString') {
            // Array of linestrings
            // which are arrays of points
            // which are arrays of ordinates
            lineStrings = geometry.get('coordinates'); // Array of line strings

            // Get the last point of the last line.
            var lineString = lineStrings[lineStrings.length - 1]; // get last line of line strings
            var lastPoint = lineString[lineString.length - 1]; // last point of the last line
            newLineString = [lastPoint, newPoint]; // Previous point + new point
            lineStrings.push(newLineString);
            // Reset the coordinates to trigger coordinates change event.
            geometry.set({'coordinates': lineStrings});
            geometry.trigger('change:coordinates');
        } else {
            // Store the first click as a 'Point'
            if (coordinates.length == 0) {
                geometry.set({'type': 'Point', 'coordinates': newPoint});
            } else {
                // Convert to 'MultiLineString' on second click.
                newLineString = [coordinates, newPoint]; // Array of points in a line string.
                geometry.set({'type': 'MultiLineString', 'coordinates': [newLineString]});
            }
        }
    };

    RouteManager.prototype.updateLine = function (args) {
        var geometry = args.geometry;
        var polyline = args.polyline;
        var lineIndex = args.lineIndex;

        var lineStrings = geometry.get('coordinates');
        lineStrings[lineIndex] = polyline;
        var distanceMeters = 0;
        if (lineIndex > 0) {
            var previousLine = lineStrings[lineIndex - 1];
            // set last point of previous line to first point of changed line and recommpute distance
            var secondToLastPoint = previousLine[previousLine.length - 2];
            distanceMeters = secondToLastPoint[2];
            var firstPoint = polyline[0];
            distanceMeters += L.latLng(secondToLastPoint[1], secondToLastPoint[0]).distanceTo(L.latLng(firstPoint[1], firstPoint[0]));
            polyline[0][2] = distanceMeters;
            previousLine[previousLine.length - 1] = polyline[0];
        }
        var prevPoint;
        if (lineIndex < lineStrings.length - 1) {
            var nextLine = lineStrings[lineIndex + 1];
            // set first point of next line to last point of changed line
            nextLine[0] = polyline[polyline.length - 1];
            for (var i = lineIndex; i < lineStrings.length; i++) {
                prevPoint = null;
                // Assign distances to points
                $.each(lineStrings[i], function (i, point) {
                    var latLng = L.latLng(point[1], point[0]);
                    if (prevPoint != null) {
                        distanceMeters += latLng.distanceTo(prevPoint);
                        point[2] = distanceMeters;
                    } else {
                        // zero or distanceMeters for last point in previous line
                        point[2] = distanceMeters;
                    }
                    prevPoint = latLng;
                });
            }
        }
        geometry.set({'coordinates': lineStrings});
        geometry.trigger('change:coordinates');
    };


    return RouteManager;
});
