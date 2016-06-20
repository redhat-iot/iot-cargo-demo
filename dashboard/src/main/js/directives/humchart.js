'use strict';


angular.module('app').directive('humChart', function (Alerts) {


    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/humchart.html',
        controller: 'HumController',
        link: function postLink(scope, element, attrs) {


            var graph = new Rickshaw.Graph({
                element: element.find('#chart')[0],
                // width: 500,
                height: 80,
                min: 0,
                max: 1,
                series: new Rickshaw.Series.FixedDuration([{name: 'Humidity', color: 'green'}], undefined, {
                    timeInterval: 20,
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
                    max: 1,
                    stops: [
                        {offset: "0%", color: "green"},
                        {offset: "80%", color: "green"},
                        {offset: "80%", color: "yellow"},
                        {offset: "90%", color: "yellow"},
                        {offset: "90%", color: "red"},
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

            var hoverDetail = new Rickshaw.Graph.HoverDetail( {
                graph: graph,
                formatter: function(series, x, y) {
                    var date = '<span class="date">' + new Date(x).toLocaleString() + '</span>';
                    var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
                    var content = swatch + series.name + ": " + parseFloat(y).toFixed(2) + '%<br>' + date;
                    return content;
                }
            } );

            var y_axis = new Rickshaw.Graph.Axis.Y({
                graph: graph,
                orientation: 'left',
                tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                element: element.find('#y_axis')[0]
            });


            graph.render();

            function listener(newData) {
                scope.$apply(function () {

                    newData.humidity /= 100.0;
                    if (newData.humidity >= 0.9) {
                        
                        Alerts.addAlert(newData.pkgId, scope.getDesc(newData.pkgId), 'danger', 'Danger!', "Humidity exceeded 90%");
                    } else if (newData.humidity >= 0.8) {
                        Alerts.addAlert(newData.pkgId, scope.getDesc(newData.pkgId), 'warning', 'Warning!', "Humidity exceeded 80%");
                    }

                    if (newData.pkgId != scope.currentShipment.pkgId) {
                        return;
                    }
                    scope.currentHumidity = newData.humidity * 100;

                    graph.series.addData({
                        Humidity: newData.humidity
                    }, newData.timestamp);
                    graph.update();
                });
            }

            scope.$on('selectedShipment', function (event, arg) {
                // if (scope.currentShipment.pkgId) {
                //     scope.unsubscribe(scope.currentShipment.pkgId);
                // }

                scope.currentShipment  = arg;
                graph.series.setTimeBase(new Date().getTime() / 1000);
                while (graph.series[0].data.length > 0) {
                    graph.series.dropData();
                }

                // populate graph with recent data
                scope.currentHumidity = 0;

                var startOfGraph = new Date().getTime() - (2 * 10 * 1000);
                scope.getRecentData(arg.pkgId, 'humidity', startOfGraph, function(res) {
                    res.forEach(function (humObj) {
                        graph.series.addData({
                            Humidity: parseFloat(humObj.humidity / 100.0),
                        }, parseInt(humObj.timestamp));
                        scope.currentHumidity = humObj.humidity / 100.0;
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
