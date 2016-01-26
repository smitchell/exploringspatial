define(function(require) {
    "use strict";
    var Backbone   = require('backbone'),
        Highcharts = require('highcharts');

    var ElevationChartView = Backbone.View.extend({

        initialize: function (args) {
            this.dispatcher = args.dispatcher;
            this.render();
        },


        render: function () {
            var self = this;
            var metersToMiles = 0.000621371;
            var metersToFeet = 3.28084;
            var milesToMeters = 1609.34;

            var i = 0;
            var data = [];
            if (this.collection.length > 0) {
                var firstMeasurement = this.collection.at(i++);

                var elev = null;
                while (elev = null) {
                    var elevationMeters = firstMeasurement.get("elevationMeters");
                    if (elevationMeters) {
                        elev = Math.round(elevationMeters * metersToFeet);
                    } else {
                        firstMeasurement = this.collection.at(i++);
                    }
                }
                var minElevation = elev;
                var maxElevation = elev;
                this.collection.each(function (measurement) {
                    var elevationMeters = measurement.get("elevationMeters");
                    var miles = measurement.get("distanceMeters") * metersToMiles;
                    if (elevationMeters && miles) {
                        elev = elevationMeters * metersToFeet;
                        if (elev > maxElevation) {
                            maxElevation = elev;
                        }
                        if (elev < minElevation) {
                            minElevation = elev;
                        }
                        data.push([miles, elev]);
                    }
                });
            }

            this.chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'chart',
                        zoomType: 'xy'
                    },
                    title: {
                        text: '',
                        style: {
                            display: 'none'
                        }
                    },
                    subtitle: {
                        text: '',
                        style: {
                            display: 'none'
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Elevation (ft)'
                        },
                        labels: {
                            formatter: function () {
                                return Math.round(this.value);
                            }
                        },
                        min: minElevation,
                        max: maxElevation
                    },
                    xAxis: {
                        title: {
                            text: 'Distance (mi)'
                        },
                        labels: {
                            formatter: function () {
                                return Math.round(this.value * 100) / 100;
                            }
                        },
                        min: 0
                    },
                    tooltip: {
                        crosshairs: {
                            color: 'green',
                            dashStyle: 'solid'
                        },
                        formatter: function () {
                            return Math.round(this.y) + ' ft.';
                        }
                    },
                    plotOptions: {
                        area: {
                            fillOpacity: 0.5
                        },
                        series: {
                            point: {
                                events: {
                                    mouseOver: function (event) {
                                        self.dispatcher.trigger(self.dispatcher.Events.CHART_MOUSEOVER, {distanceMeters: event.target.x * milesToMeters});
                                    },
                                    mouseOut: function (event) {
                                        self.dispatcher.trigger(self.dispatcher.Events.CHART_MOUSEOUT);
                                    }
                                }
                            },
                            events: {
                                mouseOut: function () {
                                    self.dispatcher.trigger(self.dispatcher.Events.CHART_MOUSEOUT);
                                }
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Elevation',
                            data: data
                        }]
                }
            );
        },

        destroy: function () {
            if (this.chart) {
                this.chart.destroy();
            }
            // Remove view from DOM
            this.remove();
        }
    });

    return ElevationChartView;
});
