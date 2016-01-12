define([
    'jquery',
    'underscore',
    'backbone',
    'text!demos/demo10/templates/HotlineControlsView.html'
], function ($, _, Backbone, templateHtml) {
    var ElevationChartView = Backbone.View.extend({

        events: {
            'input .paletteColor': 'updatePalette',
            'input #outlineColor': 'updateOutlineColor',
            'input .styleControl': 'updateStyle'
        },

        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.rangeMultiplier = args.rangeMultiplier
        },

        updatePalette: function () {
            var color1 = $('#paletteColor1').val();
            var color2 = $('#paletteColor2').val();
            var color3 = $('#paletteColor3').val();
            var style = {
                'palette': {
                    0.0: color1,
                    0.5: color2,
                    1.0: color3
                }
            };
            $('#palette1').html(color1);
            $('#palette2').html(color2);
            $('#palette3').html(color3);
            this.dispatcher.trigger(this.dispatcher.Events.CHANGE_STYLE, {
                type: this.dispatcher.Events.CHANGE_STYLE,
                style: style
            });
        },

        updateOutlineColor: function () {
            var color = $('#outlineColor').val();
            $('#outlineHex').html(color);
            this.dispatcher.trigger(this.dispatcher.Events.CHANGE_STYLE, {
                type: this.dispatcher.Events.CHANGE_STYLE,
                style: {'outlineColor': color}
            });
        },

        updateStyle: function (event) {
            var style = {};
            style[event.target.id] = parseInt(event.target.value, 10);
            if (event.target.id == 'min' || event.target.id == 'max') {
                var elem = $('#' + event.target.id + 'Value');
                if ($('.pace').hasClass('YouAreHere')) {
                    elem.html(this.fromMpsToPace(event.target.value / this.rangeMultiplier));
                } else {
                    elem.html(event.target.value);
                }
            }
            this.dispatcher.trigger(this.dispatcher.Events.CHANGE_STYLE, {
                type: this.dispatcher.Events.CHANGE_STYLE,
                style: style
            });
        },

        fromMpsToPace: function (metersPerSecond) {
            var minutesPerMile = 26.8224 / Number(metersPerSecond);
            minutes = Math.floor(minutesPerMile);
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            seconds = Math.floor((minutesPerMile - minutes) * 60);
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return minutes + ":" + seconds;
        },

        destroy: function () {
            // Remove view from DOM
            this.remove();
        }

    });

    return ElevationChartView;
});
