define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var Events = {
        ON_RESET_PROVIDER_MENU: 'ON_RESET_PROVIDER_MENU',
        ON_RESET_TYPE_MENU: 'ON_RESET_TYPE_MENU',
        ON_PROVIDER_CLICKED: 'ON_PROVIDER_CLICKED',
        ON_TYPE_CLICKED: 'ON_TYPE_CLICKED'
    };

    var MapEventDispatcher = _.extend({}, Backbone.Events);

    MapEventDispatcher.Events = Events;
    return MapEventDispatcher;
});