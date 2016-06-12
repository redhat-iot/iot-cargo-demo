'use strict';

angular.module('app')

    .filter('reverse', function () {
        return function (items) {
            return items.slice().reverse();
        };
    })

    .filter('capitalize', function() {
        return function(input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })

.controller("HomeController",
        ['$scope', '$http', '$filter', 'Notifications', 'SensorData',
            function ($scope, $http, $filter, Notifications, SensorData) {

            }])

    .controller("TempController",
        ['$scope', '$http', 'Notifications', 'SensorData',
            function ($scope, $http, Notifications, SensorData) {

                $scope.addListener = function (l) {
                    SensorData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    SensorData.removeListener(l);
                };

                $scope.currentShipment = {};
            }])

    .controller("HumController",
        ['$scope', '$http', 'Notifications', 'SensorData',
            function ($scope, $http, Notifications, SensorData) {

                $scope.currentShipment = {};

                $scope.addListener = function (l) {
                    SensorData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    SensorData.removeListener(l);
                };
            }])
    .controller("DispController",
        ['$scope', '$http', 'Notifications', 'SensorData',
            function ($scope, $http, Notifications, SensorData) {

                $scope.currentShipment = {};

                $scope.addListener = function (l) {
                    SensorData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    SensorData.removeListener(l);
                };
            }])
    .controller("AlertListController",
        ['$timeout', '$scope', '$http', 'Notifications', 'SensorData', 'Alerts',
            function ($timeout, $scope, $http, Notifications, SensorData, Alerts) {

                $scope.alerts = Alerts.getAlerts();

                $scope.$on('alert', function (event, alert) {
                    $scope.alerts = Alerts.getAlerts();
                });

                Alerts.addAlert("system", "info", "Startup", "Fetching shipments...");
                Alerts.addAlert("system", "info", "Startup", "Initializing Sensor Telemetry...");
                Alerts.addAlert("system", "success", "System Initialized", "System is Ready");


                $scope.getAlertCount = function(pkgId, type) {
                    if ($scope.alerts == null) {
                        return 0;
                    }
                    return $scope.alerts.filter(function(alert) {
                        if (alert == null) return false;
                        return ((alert.pkgId == pkgId) && (alert.type == type));
                    }).length;
                };

                $scope.clearAlerts = function () {
                    Alerts.clearAlerts();
                    $scope.alerts = [];
                };
                $scope.addListener = function (l) {
                    SensorData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    SensorData.removeListener(l);
                };

            }])

    .controller("MapController",
        ['$timeout', '$scope', '$http', 'Notifications', "SensorData", "NgMap",
            function ($timeout, $scope, $http, Notifications, SensorData, NgMap) {
                $scope.addListener = function (l) {
                    SensorData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    SensorData.removeListener(l);
                };

                $scope.shipFrom = "";
                $scope.shipTo = "";

                var timers = [];

                $scope.$on('selectedShipment', function (event, arg) {
                    console.log("Updating map: " + JSON.stringify(arg));
                    timers.forEach(function (timer) {
                        clearTimeout(timer);
                    });
                    timers = [];
                    
                    $scope.shipFrom = arg.fromAddress;
                    $timeout(function() {
                        $scope.shipTo = arg.toAddress;
                    }, 100);

                    var st = setTimeout(function () {
                        NgMap.getMap().then(function (map) {
                            map.markers.cp.setMap(null);
                            var steps = map.directionsRenderers[0].directions.routes[0].legs[0].steps;
                            var totalsteps = steps.length;
                            var curStepIdx = Math.floor(totalsteps * 0.2);
                            var curStep = steps[curStepIdx];

                            map.markers.cp.setMap(map);
                            map.markers.cp.setPosition(curStep.start_location);
                            
                            function movecontainer(marker, dlat, dlng, index, total, delay) {
                                var t = setTimeout(function () {
                                    movemarker(marker, dlat, dlng, index, total);
                                }, delay);
                                timers.push(t);
                            }

                            function movemarker(marker, dlat, dlng, index, total) {
                                var newpos = new google.maps.LatLng(marker.getPosition().lat() + dlat,
                                    marker.getPosition().lng() + dlng);
                                marker.setPosition(newpos);
                                map.setCenter(newpos);
                                if (index < total) {
                                    var t2 = setTimeout(function () {
                                        movemarker(marker, dlat, dlng, index + 1, total);
                                    }, 1000);
                                    timers.push(t2);
                                }
                            }

                            for (var i = curStepIdx, idx = 0; i < totalsteps; i++, idx++) {
                                var startloc = steps[i].start_location;
                                var endloc = steps[i].end_location;
                                var dlat = (endloc.lat() - startloc.lat()) / 50;
                                var dlng = (endloc.lng() - startloc.lng()) / 50;
                                movecontainer(map.markers.cp, dlat, dlng, 0, 50, 1000 * 50 * idx);
                            }
                        });
                    }, 1000);
                    timers.push(st);
                });


            }])
    .controller("ShipListController",
        ['$rootScope', '$scope', '$http', 'Notifications', "ConfigData",
            function ($rootScope, $scope, $http, Notifications, ConfigData) {
                $scope.addListener = function (l) {
                    ConfigData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    ConfigData.removeListener(l);
                };

                $scope.shipments = ConfigData.getData();
                $scope.selectedShipment = null;
                $scope.shipalerts = [];

                $scope.isSelected = function(shipment) {
                    return $scope.selectedShipment.pkgId == shipment.pkgId;
                };
                $scope.selectShipment = function(shipment) {
                    console.log("selecting shipment: " + JSON.stringify(shipment) + " : current Shipment: " + JSON.stringify($scope.selectedShipment));
                    if ($scope.selectedShipment && (shipment.pkgId == $scope.selectedShipment.pkgId)) {
                        return;
                    }
                    $scope.selectedShipment = shipment;
                    $rootScope.$broadcast('selectedShipment', shipment);
                };

                // TODO: alerts should come from server eventually...
                $scope.$on('alert', function (event, alert) {
                    $scope.shipalerts.push(alert);
                });

                ConfigData.addListener(function () {
                    $scope.shipments = ConfigData.getData();
                });

            }])

    .controller("HeaderController",
        ['$scope', '$location', '$http', 'Notifications', 'ConfigData',
            function ($scope, $location, $http, Notifications, ConfigData) {
                $scope.userInfo = {
                    fullName: "John Q. Shipper"
                };

                $scope.shipmentCount = ConfigData.getData().length;
                $scope.$watch(function() {
                    return ConfigData.getData().length;
                }, function(newVal, oldVal) {
                    $scope.shipmentCount = newVal;
                });

            }]);
