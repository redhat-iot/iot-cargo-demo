'use strict';


angular.module('app').directive('tempChart', function (Alerts) {


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
                series: new Rickshaw.Series.FixedDuration([{name: 'one'}], undefined, {
                    timeInterval: 2,
                    maxDataPoints: 10,
                    timeBase: new Date().getTime() / 1000
                })
            });

            graph.registerRenderer(new Rickshaw.Graph.Renderer.Xkcd({
                graph: graph
            }));

            graph.setRenderer("xkcd", {stops: {
                min: 0,
                max: 100,
                stops: [
                    {offset: "0%", color: "yellow"},
                    {offset: "20%", color: "yellow"},
                    {offset: "20%", color: "green"},
                    {offset: "90%", color: "green"},
                    {offset: "90%", color: "red"},
                    {offset: "100%", color: "red"}
                ]}
            });

            var xAxis = new Rickshaw.Graph.Axis.X({
                graph: graph,
                tickFormat: function (x) {
                    return new Date(x * 1000).toLocaleTimeString();
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


            graph.render();

            function listener(newData) {

                if (newData.temperature >= 90) {
                    Alerts.addAlert(newData.pkgId, 'danger', 'Danger!', "Temperature exceeded 90C");
                } else if (newData.temperature <= 20) {
                    Alerts.addAlert(newData.pkgId, 'warning', 'Warning!', "Temperature below 20C");
                }

                if (newData.pkgId != scope.currentShipment.pkgId) {
                    return;
                }

                scope.currentTemp = newData.temperature;
                graph.series.addData({
                    one: newData.temperature
                }, newData.timestamp);
                graph.update();

            }

            scope.addListener(listener);

            scope.$on('selectedShipment', function (event, arg) {
                scope.currentShipment  = arg;
                console.log("zeroing temp");
                graph.series.setTimeBase(new Date().getTime() / 1000);
                for (var x = 0; x < 10; x++)
                    graph.series.dropData();
                graph.render();
                scope.currentTemp = 0;

            });

            element.on('$destroy', function () {
                scope.removeListener(listener);
            });
        }
    }
});
