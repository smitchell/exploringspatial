define(function(require) {
    "use strict";
    var $              = require('jquery'),
        _              = require('underscore'),
        Backbone       = require('backbone'),
        Location       = require('models/Location'),
        GeoCoder = require('utils/GeoCoder'),
        templateHtml   = require('text!demos/demo11/templates/MapLocationControlView.html');

    var MapLocationControlView = Backbone.View.extend({

        events: {
            'click .location a': 'changeLocation',
            'keypress #location': 'searchOnEnter'
        },

        initialize: function (args) {
            this.map = args.map;
            this.activeLayers = args.activeLayers;
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
            var geoCodeQuery = this.$('#location').val().trim();
            if (geoCodeQuery.length < 3) {
                return;
            }

            // Throw out things that don't belong in a keyword search.
            geoCodeQuery = this.scrubInput(geoCodeQuery);

            var geoCoder = new GeoCoder({activeLayers: this.activeLayers});

            var _self = this;
            geoCoder.geoCodeLocation({
                query: geoCodeQuery,
                success: function (response) {
                    _self.location.set(response.location.toJSON());
                    _self.location.trigger('sync');
                },
                complete: function () {
                    $('.location').val('');
                },
                error: function (location, status) {
                    if (console.log) {
                        console.log("Error geocoding '" + location.get('query') + "' " + status);
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
