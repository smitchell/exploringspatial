define(function(require) {
    "use strict";
    var _            = require('underscore'),
        Backbone     = require('backbone'),
        templateHtml = require('text!demos/demo11/templates/RoutePropertiesView.html');

    var RoutePropertiesView = Backbone.View.extend({

        initialize: function (args) {
            this.map = args.map;
            this.template = _.template(templateHtml);
            this.model.on('change', this.render, this);
            this.metersToMiles = 0.000621371;
            this.render();
        },

        render: function() {
            var json = this.model.toJSON();
            var miles =  this.model.get('meters') * this.metersToMiles;
            json.distance = Math.round(miles*100)/100;
            this.$el.html(this.template({model: json}));
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        }
    });

    return RoutePropertiesView;
});
