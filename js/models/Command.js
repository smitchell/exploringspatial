"use strict";
/**
 * The is used to do and undo commands.
 *
 */
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var Command = Backbone.Model.extend({
        do: function(){},
        undo: function(){}
    });
    return Command;
});
