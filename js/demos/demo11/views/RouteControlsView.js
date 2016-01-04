"use strict";
define([
    'jquery',
    'underscore',
    'backbone',
    'text!demos/demo11/templates/RouteControlsView.html'
], function ($, _, Backbone, templateHtml) {
    var RouteControlsView = Backbone.View.extend({

        events: {
            'click .undo a': 'handleUndo',
            'keypress .undo a': 'handleUndo',
            'click .reset a': 'handleReset',
            'keypress .reset a': 'handleReset',
            'change #snapToRoads': 'toggleSnapToRoads'
        },

        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.snapToRoads = args.snapToRoads;
            this.commands = args.commands;
            this.commands.on('change', this.commandChanged, this);
            this.template = _.template(templateHtml);
            this.render();
        },

        render: function() {
            var snapToRoads = this.snapToRoads ? 'checked' : '';
            this.$el.html(this.template({snapToRoads: snapToRoads}));
        },

        handleUndo: function () {
            var command = this.commands.pop();
            if (command) {
                command.undo();
            }
            this.commands.trigger('change');
        },


        handleReset: function () {
            if (confirm('Are you sure that you want remove everything from the map?')) {
                this.commands.reset([]);
                var geometry = this.model.get('geometry');
                geometry.set({type: '', coordinates: []});
                this.commands.trigger('change');
            }
        },

        toggleSnapToRoads: function () {
            this.snapToRoads = $('#snapToRoads').is(':checked');
            this.dispatcher.trigger(this.dispatcher.Events.CHANGE_SNAP_TO_ROAD, {
                snapToRoads: this.snapToRoads
            });
        },


        commandChanged: function () {
            if (this.commands.length > 0) {
                this.$('.undo').show();
                this.$('.reset').show();
            } else {
                this.$('.undo').hide();
                this.$('.reset').hide();
            }
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        }
    });

    return RouteControlsView;
});
