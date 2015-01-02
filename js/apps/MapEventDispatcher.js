/**
 * The MapEventDispatcher provides event dispatching for the web site and issued for
 * cross-view event notificaiton.
 */
define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var Events = {
        ON_BASE_LAYER_CHANGED: 'ON_BASE_LAYER_CHANGED',
        ON_MENU_STATE_CHANGE: 'ON_MENU_STATE_CHANGE',
        ON_PROVIDER_CHANGED: 'ON_PROVIDER_CHANGED',
        ON_PROVIDER_CLICKED: 'ON_PROVIDER_CLICKED',
        ON_OVERLAY_CLICKED: 'ON_OVERLAY_CLICKED',

        ON_TYPE_CLICKED: 'ON_TYPE_CLICKED'
    };

    var MapEventDispatcher = _.extend({}, Backbone.Events);

    MapEventDispatcher.Events = Events;
    return MapEventDispatcher;
});