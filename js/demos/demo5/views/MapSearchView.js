/**
 * The purpose of the MapSearchView is to control user interaction with the map search filter.
 */
"use strict";
define(function(require) {
    var $              = require('jquery'),
        _              = require('underscore'),
        Backbone       = require('backbone'),
        templateHtml   = require('text!demos/demo5/templates/MapSearchView.html');
        require('jquery_ui');

    var MapSearchView = Backbone.View.extend({

        events: {
            'click #searchButton': 'search',
            'keypress .location': 'searchOnEnter',
            'keypress #keyword': 'searchOnEnter'
        },

        initialize: function (args) {
            this.template = _.template(templateHtml);
            this.location = args.location;
            this.mapProviders = args.mapProviders;
            this.render();
        },

        render: function () {
            var json = this.model.toJSON();
            json.minDate = this.formatDate(this.model.get('minDate'));
            json.maxDate = this.formatDate(this.model.get('minDate'));
            var html = this.template(json);
            jQuery(this.el).html(html);
            $('#minDate').datepicker({
                dateFormat: 'mm/dd/yy',
                changeMonth: true,
                changeYear: true,
                selectOtherMonths: true,
                showOtherMonths: true,
                showStatus: true,
                onClose: function () {
                    this.focus();
                }
            });
            $('#maxDate').datepicker({
                dateFormat: 'mm/dd/yy',
                changeMonth: true,
                changeYear: true,
                selectOtherMonths: true,
                showOtherMonths: true,
                showStatus: true,
                onClose: function () {
                    this.focus();
                }
            });
        },

        search: function () {
            var $searchButton = this.$('#searchButton');
            // No searching while a search is in progress
            if (!$searchButton.hasClass('searching')) {
                // No searching until you have something to search for.
                var location = this.$('.location').val();
                if (location.length > 0) {
                    this.changeLocation(location);
                }
                var properties = {};
                var input = this.scrubInput(this.$('#keyword').val());
                if (input != this.model.get('name')) {
                    properties.name = input;
                }
                input = this.scrubInput(this.$('#minDistance').val());
                var curVal = this.model.get('minDistance');
                if ((input.length == 0 && curVal.length != 0) || isNaN(input)) {
                    properties.minDistance = '';
                } else {
                    properties.minDistance = Number(input);
                }
                input = this.scrubInput(this.$('#maxDistance').val());
                curVal = this.model.get('maxDistance');
                if ((input.length == 0 && curVal.length != 0) || isNaN(input)) {
                    properties.maxDistance = '';
                } else {
                    properties.maxDistance = Number(input);
                }
                properties.minDate = this.parseDate(this.scrubInput(this.$('#minDate').val()));
                properties.maxDate = this.parseDate(this.scrubInput(this.$('#maxDate').val()));
                this.model.set(properties);
            }
        },

        changeLocation: function (geoCodeQuery) {
            var $searchButton = this.$('#searchButton');
            // Show the search in progress indicator
            $searchButton.addClass('searching');

            // Throw out things that don't belong in a keyword search.
            geoCodeQuery = this.scrubInput(geoCodeQuery);

            var geoCoder = this.mapProviders.getSelectedProvider().getGeoCoder();

            var _self = this;
            geoCoder.fetch({
                query: geoCodeQuery,
                success: function (response) {
                    _self.location.set(response.location.toJSON());
                    _self.location.trigger('sync');
                },
                complete: function () {
                    $searchButton.removeClass('searching');
                    $('.location').val('');
                },
                error: function (location, status) {
                    if (console.log) {
                        console.log("Error geocoding '" + location.get('query') + "' " + status);
                    }
                }
            });
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

        searchOnEnter: function (e) {
            if (e.keyCode != 13) {
                return;
            }
            this.search();
        },

        parseDate: function (value) {
            if (value != null && value.length > 0) {
                var parts = value.split('/');
                if (parts.length = 3) {
                    return new Date(parts[2], parts[0] - 1, parts[1]);
                }
            }
            return null;
        },

        formatDate: function (date) {
            if (date != null && date != '') {
                return (date.getMonth() + 1) + '/' + date.getDate() + "/" + date.getFullYear();
            }
            return '';
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        }

    });

    return MapSearchView;
});
