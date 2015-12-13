/**
 * SearchResults is a Backbone Collection of blog post SearchResult Backbone Models.
 */
define([
    'backbone',
    'models/SearchResult'
], function (Backbone, SearchResult) {
    var SearchResults = Backbone.Collection.extend({
        model: SearchResult,

        comparator: function( model ){
            return( -model.get( 'date').getTime() );
        }

    });

    return SearchResults;
});
