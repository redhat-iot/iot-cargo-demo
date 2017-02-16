'use strict';


angular.module('app').directive('tempChart', ['Alerts', function (Alerts) {


    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/tempchart.html',
        controller: 'TempController',
        link: function postLink(scope, element, attrs) {


            var graph = new Rickshaw.Graph({
                element: element.find('#chart')[0],
                // width: 500,
                height: 80,
                min: 0,
                max: 100,
                stack: false,
                series: new Rickshaw.Series.FixedDuration([{name: 'Temperature', color: 'steelblue'}], undefined, {
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
                    max: 100,
                    stops: [
                        {offset: "0%", color: "yellow"},
                        {offset: "20%", color: "yellow"},
                        {offset: "20%", color: "green"},
                        {offset: "90%", color: "green"},
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

            var y_axis = new Rickshaw.Graph.Axis.Y({
                graph: graph,
                orientation: 'left',
                tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                element: element.find('#y_axis')[0]
            });

            var hoverDetail = new Rickshaw.Graph.HoverDetail( {
                graph: graph,
                formatter: function(series, x, y) {
                    var date = '<span class="date">' + new Date(x).toLocaleString() + '</span>';
                    var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
                    var content = swatch + series.name + ": " + parseFloat(y).toFixed(2) + '°C<br>' + date;
                    return content;
                }
            } );
            graph.render();

            function listener(newData) {
                scope.$apply(function () {

                    if (newData.ambient >= 90) {
                        Alerts.addAlert(newData.pkgId, scope.getDesc(newData.pkgId), 'danger', 'Danger!', "Temperature exceeded 90C");
                    } else if (newData.ambient <= 20) {
                        Alerts.addAlert(newData.pkgId, scope.getDesc(newData.pkgId), 'warning', 'Warning!', "Temperature below 20C");
                    }

                    if (newData.pkgId != scope.currentShipment.pkgId) {
                        return;
                    }

                    scope.currentTemp = newData.ambient;
                    graph.series.addData({
                        Temperature: parseFloat(newData.ambient)
                    }, parseInt(newData.timestamp));
                    graph.update();
                });
            }

            //  scope.addListener(listener);

            scope.$on('selectedShipment', function (event, arg) {
                // if (scope.currentShipment.pkgId) {
                //     scope.unsubscribe(scope.currentShipment.pkgId);
                // }

                scope.currentShipment = arg;
                graph.series.setTimeBase(new Date().getTime() / 1000);

                while (graph.series[0].data.length > 0) {
                    graph.series.dropData();
                }

                // populate graph with recent data
                scope.currentTemp = 0;

                var startOfGraph = new Date().getTime() - (2 * 10 * 1000);
                scope.getRecentData(arg.pkgId, 'ambient', startOfGraph, function (res) {
                    res.forEach(function (tempobj) {
                        graph.series.addData({
                            Temperature: parseFloat(tempobj.ambient)
                        }, parseInt(tempobj.timestamp));
                        scope.currentTemp = tempobj.ambient;
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
    };
}]);
