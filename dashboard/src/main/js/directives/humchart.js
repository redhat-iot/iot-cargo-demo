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
                series: new Rickshaw.Series.FixedDuration([{name: 'one'}], undefined, {
                    timeInterval: 20,
                    maxDataPoints: 10,
                    timeBase: new Date().getTime() / 1000
                })
            });

            graph.registerRenderer(new Rickshaw.Graph.Renderer.Xkcd({
                graph: graph
            }));

            graph.setRenderer("xkcd", {stops: {
                min: 0,
                max: 1,
                stops: [
                    {offset: "0%", color: "green"},
                    {offset: "80%", color: "green"},
                    {offset: "80%", color: "yellow"},
                    {offset: "90%", color: "yellow"},
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
                if (newData.humidity >= 0.9) {
                    Alerts.addAlert(newData.pkgId, 'danger', 'Danger!', "Humidity exceeded 90%");
                } else if (newData.humidity >= 0.8) {
                    Alerts.addAlert(newData.pkgId, 'warning', 'Warning!', "Humidity exceeded 80%");
                }

                if (newData.pkgId != scope.currentShipment.pkgId) {
                    return;
                }
                scope.currentHumidity = newData.humidity * 100;

                graph.series.addData({
                    one: newData.humidity
                }, newData.timestamp);
                graph.update();
            }

            scope.addListener(listener);

            scope.$on('selectedShipment', function (event, arg) {
                graph.series.setTimeBase(new Date().getTime() / 1000);
                for (var x = 0; x < 10; x++)
                    graph.series.dropData();
                graph.render();
                scope.currentHumidity = 0;
            });

            element.on('$destroy', function () {
                scope.removeListener(listener);
            });
        }
    }
});
