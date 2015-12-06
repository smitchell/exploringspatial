/**
 * The purpose of the MapSearchView is to control user interaction with the map search filter.
 */
define([
    'underscore',
    'backbone',
    'text!demos/demo5/templates/MapSearchView.html',
    'jquery-ui'
], function(_, Backbone, templateHtml) {

    var MapSearchView = Backbone.View.extend({

        events: {
            'click #searchButton' : 'search',
            'keypress .location' : 'searchOnEnter',
            'keypress #keyword' : 'searchOnEnter',
            'click #showTrigger' : 'expandSearch',
            'click #hideTrigger' : 'collapseSearch'
        },

        initialize: function(args) {
            this.template = _.template(templateHtml);
            this.location = args.location;
            this.mapProviders = args.mapProviders;
            this.render();
        },

        render: function() {
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
                onClose: function() {
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
                onClose: function() {
                    this.focus();
                }
            });
        },

        search: function() {
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

        changeLocation: function(location) {
            var $searchButton = this.$('#searchButton');
            // Show the search in progress indicator
            $searchButton.addClass('searching');

            // Throw out things that don't belong in a keyword search.
            location = this.scrubInput(location);

            var geoCoder = this.mapProviders.getSelectedProvider().getGeoCoder();

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
                complete: function() {
                    $searchButton.removeClass('searching');
                    $('.location').val('');
                }
            });
        },

        scrubInput: function(value) {
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

        searchOnEnter: function(e) {
            if (e.keyCode != 13) {
                return;
            }
            this.search();
        },

        expandSearch: function() {
            this.$('#showTrigger').hide();
            this.$('#hideTrigger').show();
            this.$('.expandedSearchFilters').slideDown();
        },

        collapseSearch: function() {
            this.$('#hideTrigger').hide();
            this.$('#showTrigger').show();
            this.$('.expandedSearchFilters').slideUp();
        },

        parseDate: function(value) {
            if (value != null && value.length > 0) {
                var parts = value.split('/');
                if (parts.length = 3) {
                    return new Date(parts[2], parts[0] - 1, parts[1]);
                }
            }
            return null;
        },

        formatDate: function(date) {
            if (date != null && date != '') {
                return (date.getMonth() + 1) + '/' + date.getDate() + "/" + date.getFullYear();
            }
            return '';
        },

        destroy: function() {
            // Remove view from DOM
            this.remove();
        }

    });

    return MapSearchView;
});
