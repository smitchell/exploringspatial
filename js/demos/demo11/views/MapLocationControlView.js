"use strict";
define([
    'jquery',
    'underscore',
    'backbone',
    'models/Location',
    'models/GoogleGeoCoder',
    'text!demos/demo11/templates/MapLocationControlView.html'
], function ($, _, Backbone, Location, GoogleGeoCoder, templateHtml) {
    var MapLocationControlView = Backbone.View.extend({

        events: {
            'click .location a': 'changeLocation',
            'keypress #location': 'searchOnEnter'
        },

        initialize: function (args) {
            this.map = args.map;
            this.template = _.template(templateHtml);
            this.location = new Location();
            // listen for location changes from the map search view.
            this.location.on('sync', this.syncMapLocation, this);
            this.render();
        },

        render: function() {
            this.$el.html(this.template());
        },

        changeLocation: function () {
            var location = this.$('#location').val().trim();
            if (location.length < 3) {
                return;
            }

            // Throw out things that don't belong in a keyword search.
            location = this.scrubInput(location);

            var geoCoder = new GoogleGeoCoder();

            // Clear the previous search results
            geoCoder.clear({silent: true});

            // Execute the search. If the query is successful the MapView will be notified
            // because it is bound to the Location model sync event.
            geoCoder.set('query', location);
            var _self = this;
            geoCoder.fetch({
                success: function () {
                    _self.location.set(geoCoder.toJSON());
                    _self.location.trigger('sync');
                },
                complete: function () {
                    $('.location').val('');
                },
                error: function (object, xhr, options) {
                    if (console.log && xhr && xhr.responseText) {
                        console.log(xhr.status + " " + xhr.responseText);
                    }
                }
            });
        },

        syncMapLocation: function () {
            this.$('#location').val('');
            if (this.location != null) {
                var lat = this.location.get('lat');
                var lon = this.location.get('lon');
                var zoom = 10;
                if (this.location.get('zoom') != null) {
                    zoom = this.location.get('zoom');
                }
                if (lat != null && lon != null) {
                    this.map.setView({lat: lat,lng: lon}, zoom);
                }
            }
        },

        searchOnEnter: function (e) {
            if (e.keyCode != 13) {
                return;
            }
            this.changeLocation();
        },

        scrubInput: function (value) {
            var scrubbed = '';
            if (typeof value != 'undefined' && value != null) {
                scrubbed = value.trim();
                if (scrubbed.length > 0) {
                    scrubbed = scrubbed.split('<').join('');
                    scrubbed = scrubbed.split('>').join('');
                }
            }
            return scrubbed;
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        }
    });

    return MapLocationControlView;
});
