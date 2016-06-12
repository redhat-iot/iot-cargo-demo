'use strict';


angular.module('app').directive('dispChart', function (Alerts) {


    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/dispchart.html',
        controller: 'DispController',
        link: function postLink(scope, element, attrs) {

            var graph = new Rickshaw.Graph({
                element: element.find('#chart')[0],
                // width: 500,
                height: 80,
                min: -50,
                max: 50,
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
                min: -50,
                max: 50,
                stops: [
                    {offset: "0%", color: "red"},
                    {offset: "40%", color: "red"},
                    {offset: "40%", color: "green"},
                    {offset: "60%", color: "green"},
                    {offset: "60%", color: "red"},
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
             //   tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                element: element.find('#y_axis')[0]
            });


            graph.render();

            function listener(newData) {
                if (Math.abs(newData.displacement) >= 5) {
                    Alerts.addAlert(newData.pkgId, 'danger', 'Danger!', "Displacement exceeded 5m");
                } else if (Math.abs(newData.displacement) >= 3) {
                    Alerts.addAlert(newData.pkgId, 'warning', 'Warning!', "Displacement exceeded 3m");
                }

                if (newData.pkgId != scope.currentShipment.pkgId) {
                    return;
                }
                scope.currentDisplacement = newData.displacement;

                graph.series.addData({
                    one: newData.displacement
                }, newData.timestamp);
                graph.update();


            }

            scope.addListener(listener);

            scope.$on('selectedShipment', function (event, arg) {
                graph.series.setTimeBase(new Date().getTime() / 1000);
                for (var x = 0; x < 10; x++)
                    graph.series.dropData();
                graph.render();
                scope.currentDisplacement = 0;
            });

            element.on('$destroy', function () {
                scope.removeListener(listener);
            });
        }
    }
});
