/**
 * The is used to do and undo commands.
 *
 */
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    "use strict";
    var Command = Backbone.Model.extend({
        do: function(){},
        undo: function(){}
    });
    return Command;
});
