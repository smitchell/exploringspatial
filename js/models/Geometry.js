/**
 * Geometry is a Backbone model representing a GeoJSON Geometry Object.
 *
 * See http://geojson.org/geojson-spec.html#geometry-objects
 *
 * A geometry is a GeoJSON object where the type member's value is one of the following strings: "Point", "MultiPoint", "LineString",
 * "MultiLineString", "Polygon", "MultiPolygon", or "GeometryCollection".
 *
 * A GeoJSON geometry object of any type other than "GeometryCollection" must have a member with the name "coordinates".
 * The value of the coordinates member is always an array. The structure for the elements in this array is determined by the type of geometry.
 *
 */
define([
    'backbone',
    'collections/Coordinates'
], function (Backbone, Coordinates) {
    var Geometry = Backbone.Model.extend({
        defaults: {
            // type: (required) "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", or "GeometryCollection"
            coordinates: new Coordinates()
        }
    });
    return Geometry;
});
