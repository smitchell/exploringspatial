/**
 * GoogleGeoCoder is a Backbone model representing a place on a Google map
 *
 */
define([
    'models/Location'
], function (Location) {
    var GoogleGeoCoder = Location.extend({
        geoCoder: null,

        getGeoCoder: function() {
            if (this.geoCoder == null) {
                this.geoCoder = new google.maps.Geocoder();
            }
            return this.geoCoder
        },

        fetch: function(options) {
            _self = this;
            this.getGeoCoder().geocode({'address': this.get('query')}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                    _self.set({lat: results[0].geometry.location.lat(), lon: results[0].geometry.location.lng()});
                    if (typeof options != 'undefined' && options.success != 'undefined') {
                        options.success(results);
                    }
                }
                if (typeof options != 'undefined' && options.complete != 'undefined') {
                    options.complete(status);
                }
            })
        }
    });
    return GoogleGeoCoder;
});
