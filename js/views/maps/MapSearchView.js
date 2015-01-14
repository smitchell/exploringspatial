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
            this.collection = args.collection;
            this.render();
        },

        render: function() {
            var html = this.template();
            jQuery(this.el).html(html);
        },

        search: function() {
            var $searchButtonProgress = this.$('#searchButtonProgress');
            // No searching while a search is in progress
            if ($searchButtonProgress.is(':hidden')) {
                // No searching until you have something to search for.
                var query = this.$('.location').val();
                if (query.length > 0) {
                    // Show the search in progress indicator
                    $searchButtonProgress.show();

                    // Throw out things that don't belong in a keyword search.
                    query = query.split('<').join('');
                    query = query.split('>').join('');
                    query = query.split('/').join('');

                    var geoCoder = this.collection.getSelectedProvider().getGeoCoder();

                    // Clear the previous search results
                    geoCoder.clear({silent: true});

                    // Execute the search. If the query is successful the MapView will be notified
                    // because it is bound to the Location model sync event.
                    geoCoder.set('query', query);
                    var _self = this;
                    geoCoder.fetch({
                        success: function () {
                            _self.location.set(geoCoder.toJSON());
                            _self.location.trigger('sync');
                        },
                        complete: function() {
                            $('#searchButtonProgress').hide();
                            $('.location').val('');
                        }
                    });
                }
            }
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
