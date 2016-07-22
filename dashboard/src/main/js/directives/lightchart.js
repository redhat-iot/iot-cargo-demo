'use strict';


angular.module('app').directive('lightChart', function (Alerts) {


    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/lightchart.html',
        controller: 'LightController',
        link: function postLink(scope, element, attrs) {

            var graph = new Rickshaw.Graph({
                element: element.find('#chart')[0],
                // width: 500,
                height: 80,
                min: 0,
                max: 5000,
                series: new Rickshaw.Series.FixedDuration([{name: 'Light', color: '#E9B200'}], undefined, {
                    timeInterval: 2,
                    maxDataPoints: 10,
                    timeBase: new Date().getTime()
                })
            });

            graph.registerRenderer(new Rickshaw.Graph.Renderer.Xkcd({
                graph: graph
            }));

            graph.setRenderer("xkcd", {
                stops: {
                    min: 0,
                    max: 5000,
                    stops: [
                        {offset: "0%", color: "green"},
                        {offset: "50%", color: "green"},
                        {offset: "50%", color: "red"},
                        {offset: "100%", color: "red"}
                    ]
                }
            });

            var xAxis = new Rickshaw.Graph.Axis.X({
                graph: graph,
                tickFormat: function (x) {
                    return new Date(x).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric'
                    });
                },
                ticks: 3
            });
            xAxis.render();

            var y_axis = new Rickshaw.Graph.Axis.Y({
                graph: graph,
                orientation: 'left',
                //   tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                element: element.find('#y_axis')[0]
            });

            var hoverDetail = new Rickshaw.Graph.HoverDetail( {
                graph: graph,
                formatter: function(series, x, y) {
                    var date = '<span class="date">' + new Date(x).toLocaleString() + '</span>';
                    var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
                    var content = swatch + series.name + ": " + parseFloat(y).toFixed(2) + 'lm<br>' + date;
                    return content;
                }
            } );

            graph.render();

            function listener(newData) {

                scope.$apply(function () {

                    if (Math.abs(newData.light) >= 4000) {
                        Alerts.addAlert(newData.pkgId, scope.getDesc(newData.pkgId), 'danger', 'Danger!', "Too Bright!");
                    } else if (Math.abs(newData.light) >= 1000) {
                        Alerts.addAlert(newData.pkgId, scope.getDesc(newData.pkgId), 'warning', 'Warning!', "Brightness approaching allowed maximum");
                    }

                    if (newData.pkgId != scope.currentShipment.pkgId) {
                        return;
                    }
                    scope.currentLight = newData.light;

                    graph.series.addData({
                        Light: parseFloat(newData.light)
                    }, parseInt(newData.timestamp));
                    graph.update();
                });

            }
            
            scope.$on('selectedShipment', function (event, arg) {
                scope.currentShipment  = arg;
                graph.series.setTimeBase(new Date().getTime() / 1000);
                while (graph.series[0].data.length > 0) {
                    graph.series.dropData();
                }

                // populate graph with recent data
                scope.currentLight = 0;

                var startOfGraph = new Date().getTime() - (2 * 10 * 1000);
                scope.getRecentData(arg.pkgId, 'light', startOfGraph, function(res) {
                    res.forEach(function (lightObj) {
                        graph.series.addData({
                            Light: parseFloat(lightObj.light)
                        }, parseInt(lightObj.timestamp));
                        scope.currentLight = lightObj.light;
                    });
                    graph.render();
                });

                scope.subscribe(arg.pkgId, listener, arg.randomData);
            });

            element.on('$destroy', function () {
                if (scope.currentShipment.pkgId) {
                    scope.unsubscribe(scope.currentShipment.pkgId);
                }
            });
        }
    }
});
