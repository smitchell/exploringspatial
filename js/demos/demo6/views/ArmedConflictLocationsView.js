/**
 * The purpose of the ActivityMapLayerView is render feature collection GeoJson on the map.
 */
define([
    'underscore',
    'backbone',
    'demos/demo6/models/ArmedConflictLocation',
    'demos/demo6/views/ArmedConflictPopupView',
    'demos/demo6/collections/CodeDefinitions',
    'demos/demo6/collections/ArmedConflictLocations',
    'leaflet_prunecluster',
    'jquery-ui'
], function (_, Backbone, ArmedConflictLocation, ArmedConflictPopupView, CodeDefinitions, ArmedConflictLocations) {

    var ArmedConflictLocationsView = Backbone.View.extend({

        initialize: function (args) {
            this.acledSearch = args.acledSearch;
            this.map = args.map;
            this.countryNames = args.collection;
            this.fetchQueue = [];
            this.countryConflicts = {};
            var _self = this;
            this.countryNames.each(function (codeDefinition) {
                _self.fetchQueue.push(codeDefinition.get('definition'));
            });
            this.acledSearch.on('change', this.doFilter, this);
            this.loadAll();
        },

        render: function () {
            $('#progressbar').slideUp();
            this.conflictsLayer.ProcessView();
            this.conflictsLayer.FitBounds();
            $('.simpleSearchContainer').slideDown();
        },

        loadAll: function () {
            this.paths = new CodeDefinitions('PATH');
            this.paths.fetch();
            var $progessBar = $('#progressbar');
            var progressLabel = $('.progress-label');
            this.completion = this.countryNames.length;
            $progessBar.progressbar({
                value: false,
                change: function () {
                    progressLabel.text($progessBar.progressbar("value") + "%");
                },
                complete: function () {
                    progressLabel.text("Complete!");
                }
            });
            $progessBar.slideDown();
            this.loadCountries();
        },

        loadCountries: function () {
            var countryName = this.fetchQueue.pop();
            if (typeof countryName == 'undefined') {
                this.render();
            } else {
                var armedConflictLocations = new ArmedConflictLocations();
                armedConflictLocations.countryName = countryName.split(' ').join('');
                this.countryConflicts[countryName] = armedConflictLocations;
                var _self = this;
                armedConflictLocations.fetch({
                    success: function () {
                        _self.loadCountry(countryName);
                    }
                });
            }
        },

        percentComplete: function (value) {
            var percent = value / this.completion;
            return Math.round(percent * 100);
        },

        loadCountry: function (countryName) {
            var _self = this;
            if (typeof this.conflictsLayer == 'undefined') {
                this.conflictsLayer = new PruneClusterForLeaflet();

                this.conflictsLayer.PrepareLeafletMarker = function (marker, data, category) {
                    if (data.popup) {
                        var expandedPathDefinition = _self.paths.findByCodeDefinitionPk(data.path);
                        var armedConflictLocation = new ArmedConflictLocation({id: data.eventPk});
                        armedConflictLocation.urlRoot = expandedPathDefinition.get('definition');
                        var armedConflictPopupView = new ArmedConflictPopupView({model: armedConflictLocation});
                        armedConflictLocation.fetch({
                            success: function () {
                                if (marker.getPopup()) {
                                    marker.setPopupContent(armedConflictPopupView.render(), data.popupOptions);
                                }
                                else {
                                    marker.bindPopup(armedConflictPopupView.render(), data.popupOptions);
                                }
                            }
                        });
                    }
                };
                this.map.addLayer(this.conflictsLayer);
            }
            var coordinates, marker;
            var count = 0;
            this.countryConflicts[countryName].each(function (armedConflict) {
                count++;
                coordinates = armedConflict.get('geometry').get('coordinates');
                marker = new PruneCluster.Marker(coordinates[1], coordinates[0]);
                marker.data = armedConflict.get('properties').toJSON();
                marker.data.popup = function () {
                };
                _self.conflictsLayer.RegisterMarker(marker);
            });
            $('#progressbar').progressbar("value", ( this.percentComplete(this.countryNames.length - this.fetchQueue.length)));
            this.loadCountries();
        },

        doFilter: function () {
            if (!this.filteringInProgress) {
                var markers = this.conflictsLayer.GetMarkers();
                this.filteringInProgress = true;

                var marker;
                var minLat, minLon, maxLat, maxLon, lat, lng;
                for (var i = 0; i < markers.length; i++) {
                    marker = markers[i];
                    marker.filtered = this.acledSearch.filterMarker(marker.data);
                    if (!marker.filtered) {
                        lat = marker.position.lat;
                        lng = marker.position.lng;
                        if (typeof minLat == 'undefined' || lat < minLat) {
                            minLat = lat;
                        }
                        if (typeof minLon == 'undefined' || lng < minLon) {
                            minLon = lng;
                        }
                        if (typeof maxLat == 'undefined' || lat > maxLat) {
                            maxLat = lat;
                        }
                        if (typeof maxLon == 'undefined' || lng > maxLon) {
                            maxLon = lng;
                        }
                    }
                }

                this.conflictsLayer.ProcessView();
                if (!isNaN(minLat) && !isNaN(minLon) && !isNaN(maxLat) && !isNaN(maxLon)) {
                    this.conflictsLayer._map.fitBounds(new L.LatLngBounds(
                        new L.LatLng(minLat, minLon),
                        new L.LatLng(maxLat, maxLon)));
                }
                this.filteringInProgress = false;
            }
        },

        destroy: function() {
            // Remove view from DOM
            this.remove();
        }
    });

    return ArmedConflictLocationsView;
});
