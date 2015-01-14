/**
 * The purpose of the MapSearchView is to control user interaction with the map search filter.
 */
define([
    'underscore',
    'backbone',
    'text!templates/maps/MapSearchView.html'
], function(_, Backbone, templateHtml) {

    var MapSearchView = Backbone.View.extend({

        events: {
            'click .searchButton a' : 'search',
            'keypress .location' : 'searchOnEnter'
        },

        initialize: function(args) {
            this.template = _.template(templateHtml);
            this.location = args.location;
            this.mapProviders = args.mapProviders;
            this.render();
        },

        render: function() {
            var html = this.template(this.model.toJSON());
            jQuery(this.el).html(html);
        },

        search: function() {
            var $searchButtonProgress = this.$('#searchButtonProgress');
            // No searching while a search is in progress
            if ($searchButtonProgress.is(':hidden')) {
                // No searching until you have something to search for.
                var location = this.$('.location').val();
                if (location.length > 0) {
                    this.changeLocation(location);
                }
                var keyword = this.$('#keyword').val();
                if (keyword != this.model.get('name')) {
                    this.model.set('name', keyword);
                }
            }
        },

        changeLocation: function(location) {
            var $searchButtonProgress = this.$('#searchButtonProgress');
            // Show the search in progress indicator
            $searchButtonProgress.show();

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
                    $searchButtonProgress.hide();
                    $('.location').val('');
                    this.search(); // are there keywords too?
                }
            });
        },

        scrubInput: function(value) {
            var scrubbed = value.split('<').join('');
            scrubbed = scrubbed.split('>').join('');
            scrubbed = scrubbed.split('/').join('');
            return scrubbed;
        },

        searchOnEnter: function(e) {
            if (e.keyCode != 13) {
                return;
            }
            this.search();
        }


    });

    return MapSearchView;
});
