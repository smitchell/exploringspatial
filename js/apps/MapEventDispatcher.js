/**
 * The MapEventDispatcher provides event dispatching for the web site and issued for
 * cross-view event notificaiton.
 */
define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var Events = {
        LOCATION_CHANGED:      'LOCATION_CHANGED',
        ON_BASE_LAYER_CHANGED: 'ON_BASE_LAYER_CHANGED',
        ON_MENU_STATE_CHANGE:  'ON_MENU_STATE_CHANGE',
        ON_PROVIDER_CHANGED:   'ON_PROVIDER_CHANGED',
        ON_PROVIDER_CLICKED:   'ON_PROVIDER_CLICKED',
        ON_OVERLAY_CLICKED:    'ON_OVERLAY_CLICKED',
        ON_TYPE_CLICKED:       'ON_TYPE_CLICKED',
        // Demo 7
        ON_LAYER_MOUSEOVER:    'LAYER_MOUSEOVER',
        ON_LAYER_MOUSEOUT:     'LAYER_MOUSEOUT',
        ON_LIST_MOUSEOVER:     'LIST_MOUSEOVER',
        ON_LIST_MOUSEOUT:      'LIST_MOUSEOUT',

        // Demo 8
        ON_RACE_SELECTED:      'RACE_SELECTED',
        ON_RACE_ADDED:         'RACE_ADDED',
        ON_RACE_ZOOMED:        'RACE_ZOOMED'
    };

    var MapEventDispatcher = _.extend({}, Backbone.Events);

    MapEventDispatcher.Events = Events;
    return MapEventDispatcher;
});