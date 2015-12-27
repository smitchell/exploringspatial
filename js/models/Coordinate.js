/**
 * Coordinate is a Backbone model representing a GeoJSON Coordinate.
 *
 * See http://geojson.org/geojson-spec.html
 *
 * The "coordinates" member of a geometry object is composed of one position (in the case of a Point geometry),
 * an array of positions (LineString or MultiPoint geometries), an array of arrays of positions (Polygons, MultiLineStrings),
 * or a multidimensional array of positions (MultiPolygon).
 *
 * A position is represented by an array of numbers. There must be at least two elements, and may be more.
 * The order of elements must follow x, y, z order (easting, northing, altitude for coordinates in a projected coordinate reference system,
 * or longitude, latitude, altitude for coordinates in a geographic coordinate reference system).
 *
 *
 * Any number of additional elements are allowed -- interpretation and meaning of additional elements is beyond the scope of this specification.
 *
 * For Exploring Spatial, the following means have been applied:
 *
 * x = longitude
 * y = latitude
 * z = altitude (meters)
 * t = timestamp (milliseconds)
 * d = distance (meters)
 *
 */
define([
    'backbone'
], function (Backbone) {
    var Coordinate = Backbone.Model.extend({


    });
    return Coordinate;
});
