"use strict";
define(function(require) {
    var $            = require('jquery'),
        _            = require('underscore'),
        Backbone     = require('backbone'),
        templateHtml = require('text!demos/demo11/templates/RouteControlsView.html');

    var RouteControlsView = Backbone.View.extend({

        events: {
            'click .undo a': 'handleUndo',
            'keypress .undo a': 'handleUndo',
            'click .reset a': 'handleReset',
            'keypress .reset a': 'handleReset',
            'change #snapToRoads': 'toggleSnapToRoads',
            'change #transitMode': 'transitModeChange'
        },

        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.snapToRoads = args.snapToRoads;
            this.googleDirections = args.googleDirections;
            this.commands = args.commands;
            this.commands.on('change', this.commandChanged, this);
            this.template = _.template(templateHtml);
            this.render();
        },

        render: function() {
            var snapToRoads = this.snapToRoads ? 'checked' : '';
            var transitMode = this.googleDirections.get('transitMode');
            var walkingSelected = transitMode == 'Walking' ? 'selected' : '';
            var runningSelected = transitMode == 'Running' ? 'selected' : '';
            var bikingSelected = transitMode == 'Bicycling' ? 'selected' : '';
            this.$el.html(this.template({
                snapToRoads: snapToRoads,
                walkingSelected: walkingSelected,
                runningSelected: runningSelected,
                bikingSelected: bikingSelected
            }));
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
                this.model.get('properties').set({'meters':0});
                this.commands.trigger('change');
            }
        },

        toggleSnapToRoads: function () {
            this.snapToRoads = this.$('#snapToRoads').is(':checked');
            this.dispatcher.trigger(this.dispatcher.Events.CHANGE_SNAP_TO_ROAD, {
                snapToRoads: this.snapToRoads
            });
            if(this.snapToRoads) {
                this.$('.transitSelect').show();
            } else {
                this.$('.transitSelect').hide();
            }
        },

        transitModeChange: function() {

            this.googleDirections.set({'transitMode': this.$( "#transitMode option:selected" ).text()});
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
