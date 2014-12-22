/**
 * Entry point for the Segment Page.  Creates the main view and initiates loading of
 * content.
 */
define([
    'backbone',
    'underscore',
    'views/ActivityMapView'
], function(Backbone, _, ActivityMapView) {

    var initialize = function(args) {

        Backbone.emulateHTTP = true;

        var activityMapView = new ActivityMapView({
            mapContainer: args.mapContainer,
            mapControls: args.mapControls
        });
        // Loads the content for the view. The view will determine when it is ready to render.
        activityMapView.render();
    };

    return {
        initialize: initialize
    }
});