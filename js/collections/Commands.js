"use strict";
/**
 * Commands is a collection of Backbone Command models use to do and undo user actions.
 */
define([
        'backbone',
        'models/Command'
], function(Backbone, Command) {
var Commands = Backbone.Collection.extend({
   	model: Command

});

    return Commands;
});
