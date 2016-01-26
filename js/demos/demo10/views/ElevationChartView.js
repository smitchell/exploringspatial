define([
    'jquery',
    'backbone',
    'highcharts'
], function ($, Backbone, Highcharts) {
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
            var data = [];
            var i = 0;
            var firstMeasurement = this.collection[i++];

            var elev = null;
            while (elev = null) {
                var elevationMeters = firstMeasurement[2];
                if (elevationMeters) {
                    elev = Math.round(elevationMeters * metersToFeet);
                } else {
                    firstMeasurement = this.collection[i++];
                }
            }
            var minElevation = elev;
            var maxElevation = elev;
            $.each(this.collection, function (i, measurement) {
                var elevationMeters = measurement[2];
                var miles = measurement[3] * metersToMiles;
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
