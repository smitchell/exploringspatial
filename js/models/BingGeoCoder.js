/**
 * BingGeoCoder is a Backbone model representing a place on a Bing map
 *
 */
define([
    'models/Location'
], function (Location) {
    var BingGeoCoder = Location.extend({
        urlRoot: "http://dev.virtualearth.net/REST/v1/Locations/",

        initialize: function (args) {
            this.key = args.key;
            var _self = this;
            window.BingGeoCoderCallback = function(response) {
                _self.parse(response);
            };
        },

        url: function() {
            return this.urlRoot + this.buildQuery() + '?output=json&jsonp=BingGeoCoderCallback&key=' + this.key;
        },

        fetch: function(options) {
            this.fetchOptions = options;
            var script = document.createElement('script');
            script.type ='text/javascript';
            script.src = this.url();
            script.id = 'BingGeoCoderScript';
            $('body').append(script);
        },

        buildQuery: function() {
            var query = this.get('query');
            return  query.split(' ').join('%20');
        },

        parse: function(response) {
            if (typeof response.resourceSets != 'undefined' && response.resourceSets.length > 0) {
                var resource = response.resourceSets[0].resources[0];
                if (typeof resource.point != 'undefined') {
                    this.set({lat: resource.point.coordinates[0], lon: resource.point.coordinates[1]});
                }

                if (typeof this.fetchOptions != 'undefined' && this.fetchOptions.success != 'undefined') {
                    this.fetchOptions.success(response);
                }
            }
            if (typeof this.fetchOptions != 'undefined' && this.fetchOptions.complete != 'undefined') {
                this.fetchOptions.complete();
            }
            $('#BingGeoCoderScript').remove();
        }
    });
    return BingGeoCoder;
});
