/**
 * The MapEventDispatcher provides event dispatching for the web site and issued for
 * cross-view event notificaiton.
 */
define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var Events = {
        LOCATION_CHANGED:   'LOCATION_CHANGED',
        BASE_LAYER_CHANGED: 'BASE_LAYER_CHANGED',
        MENU_STATE_CHANGE:  'MENU_STATE_CHANGE',
        PROVIDER_CHANGED:   'PROVIDER_CHANGED',
        PROVIDER_CLICKED:   'PROVIDER_CLICKED',
        OVERLAY_CLICKED:    'OVERLAY_CLICKED',
        TYPE_CLICKED:       'TYPE_CLICKED',
        // Demo 7
        LAYER_MOUSEOVER:    'LAYER_MOUSEOVER',
        LAYER_MOUSEOUT:     'LAYER_MOUSEOUT',
        LIST_MOUSEOVER:     'LIST_MOUSEOVER',
        LIST_MOUSEOUT:      'LIST_MOUSEOUT',

        // Demo 8
        RACE_SELECTED:      'RACE_SELECTED',
        RACE_ADDED:         'RACE_ADDED',
        RACE_ZOOMED:        'RACE_ZOOMED',

        // Demo 10
        CHART_MOUSEOVER:    'CHART_MOUSEOVER',
        CHART_MOUSEOUT:     'CHART_MOUSEOUT',
        CHANGE_STYLE:       'CHANGE_STYLE'
    };

    var MapEventDispatcher = _.extend({}, Backbone.Events);

    MapEventDispatcher.Events = Events;
    return MapEventDispatcher;
});