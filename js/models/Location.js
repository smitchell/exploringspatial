/**
 * Location is a Backbone model representing a place in the world. It is used by the GeoCode examples.
 *
 */
define(function (require) {
    "use strict";
    var Backbone = require('backbone');

    var Location = Backbone.Model.extend({
        defaults: {
            lat: 38.35888,
            lon: -88.92334,
            zoom: 10
        }
    });
    return Location;
});
