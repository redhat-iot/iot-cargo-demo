'use strict';

angular.module('app')

    .filter('reverse', function () {
        return function (items) {
            return items.slice().reverse();
        };
    })

    .filter('capitalize', function () {
        return function (input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    })

    .controller("HomeController",
        ['$scope', '$http', '$filter', 'Notifications', 'SensorData', 'ConfigData',
            function ($scope, $http, $filter, Notifications, SensorData, ConfigData) {

                $scope.showDialog = false;

                $scope.newShipment = {
                    randomData: true
                };

                $scope.allShipmentPkgIds = ConfigData.getAllShipmentPkgIds();

                $scope.addShipment = function (newShipment) {
                    var newName = newShipment.name ? newShipment.name :
                        newShipment.pkgId.substr(newShipment.pkgId.lastIndexOf('/') != -1 ? (newShipment.pkgId.lastIndexOf('/') + 1) : 0);

                    ConfigData.addShipment({
                        pkgId: newShipment.pkgId ? newShipment.pkgId : newShipment.name,
                        name: newName,
                        fromAddress: newShipment.origination,
                        toAddress: newShipment.destination,
                        eta: (new Date().getTime() + (Math.random() * 144 * 60 * 60 * 1000)),
                        randomData: newShipment.randomData
                    }, function (shipments) {
                        Notifications.success("Added shipment " + newName);
                        $scope.showDialog = false;
                    }, function (err) {
                        Notifications.error("Error adding shipment: " + err);
                    });
                };
            }])

    .controller("TempController",
        ['$scope', '$modal', '$http', 'Notifications', 'SensorData', 'ConfigData',
            function ($scope, $modal, $http, Notifications, SensorData, ConfigData) {

                $scope.currentTemp = 0;
                $scope.recentData = [];

                $scope.subscribe = function (topic, listener, random) {
                    SensorData.subscribe(topic, listener, random);
                };

                $scope.unsubscribe = function (topic) {
                    SensorData.unsubscribe(topic);
                };

                $scope.getRecentData = function (pkgId, metric, startTime, cb) {
                    SensorData.getRecentData(pkgId, metric, startTime, new Date().getTime(), 50, cb);
                };

                $scope.getDesc = function (pkgId) {
                    return ConfigData.getDesc(pkgId);
                };
                $scope.isTempDownloading = false;

                $scope.showTempHistory = function () {

                    if (!$scope.currentShipment.pkgId) {
                        alert("You must choose a shipment!");
                        return;
                    }
                    $scope.isTempDownloading = true;

                    var pointCount = 50;
                    var now = new Date().getTime();
                    var msInDay = (24 * 60 * 60 * 1000);
                    var timeInc = Math.floor(msInDay / pointCount);
                    var startTime = now - msInDay;

                    function getPoint(pkgId, metric, startTime, endTime, cb) {
                        SensorData.getRecentData(pkgId, metric, startTime, endTime, 1, cb);
                    }

                    var fns = [];
                    for (var i = startTime; i < now; i += timeInc) {
                        (function (foo) {
                            fns.push(function (async_callback) {
                                getPoint($scope.currentShipment.pkgId, 'ambient', foo, foo + timeInc, function (data) {
                                    async_callback(null, data);
                                });
                            });
                        })(i);
                    }

                    async.parallel(fns, function (err, results) {
                        $scope.isTempDownloading = false;

                        var data = [];

                        results.forEach(function (singleResultArr) {
                            singleResultArr.forEach(function (res) {
                                data.push({
                                    x: parseInt(res.timestamp),
                                    y: parseFloat(res.ambient)
                                });
                            });
                        });

                        var modalInstance = $modal.open({
                            templateUrl: 'partials/history.html',
                            controller: 'HistoryController',
                            size: 'lg',
                            resolve: {
                                items: function () {
                                    return data;
                                },
                                suffix: function() { return '°C'},
                                color: function() { return 'steelblue'},
                                metric: function() { return 'Temperature'},
                                renderer: function() { return 'area'}

                            }
                        });
                    });
                };

                $scope.currentShipment = {};
            }])

    .controller("HistoryController",
        ['$scope', '$http', 'Notifications', 'SensorData', 'ConfigData', 'metric', 'color', 'suffix', 'items', 'renderer',
            function ($scope, $http, Notifications, SensorData, ConfigData, metric, color, suffix, items, renderer) {
                $scope.history_options = {
                    renderer: renderer,
                    width: 800,
                    height: 300,
                    min: -10
                };
                $scope.history_series = [{
                    name: metric,
                    color: color,
                    data: items
                }];


                $scope.history_features = {
                    hover: {
                        formatter: function(series, x, y) {
                            var date = '<span class="date">' + new Date(x).toLocaleString() + '</span>';
                            var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
                            var content = swatch + series.name + ": " + parseFloat(y).toFixed(2) + suffix + '<br>' + date;
                            return content;
                        }

                    },
                    xAxis: {
                        tickFormat: function (x) {
                            return new Date(x).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric'
                            });
                        },
                        ticks: 3

                    },
                    yAxis: {
                        tickFormat: 'formatKMBT'
                    }


                };


            }])

    .controller("HumController",
        ['$scope', '$modal', '$http', 'Notifications', 'SensorData', 'ConfigData',
            function ($scope, $modal, $http, Notifications, SensorData, ConfigData) {

                $scope.currentHumidity = 0;

                $scope.subscribe = function (topic, listener, random) {
                    SensorData.subscribe(topic, listener, random);
                };

                $scope.unsubscribe = function (topic) {
                    SensorData.unsubscribe(topic);
                };

                $scope.getRecentData = function (pkgId, metric, startTime, cb) {
                    SensorData.getRecentData(pkgId, metric, startTime, new Date().getTime(), 50, cb);
                };

                $scope.getDesc = function (pkgId) {
                    return ConfigData.getDesc(pkgId);
                };

                $scope.isHumDownloading = false;

                $scope.showHumHistory = function () {
                    if (!$scope.currentShipment.pkgId) {
                        alert("You must choose a shipment!");
                        return;
                    }
                    $scope.isHumDownloading = true;

                    var pointCount = 50;
                    var now = new Date().getTime();
                    var msInDay = (24 * 60 * 60 * 1000);
                    var timeInc = Math.floor(msInDay / pointCount);
                    var startTime = now - msInDay;

                    function getPoint(pkgId, metric, startTime, endTime, cb) {
                        SensorData.getRecentData(pkgId, metric, startTime, endTime, 1, cb);
                    }

                    var fns = [];
                    for (var i = startTime; i < now; i += timeInc) {
                        (function (foo) {
                            fns.push(function (async_callback) {
                                getPoint($scope.currentShipment.pkgId, 'humidity', foo, foo + timeInc, function (data) {
                                    async_callback(null, data);
                                });
                            });
                        })(i);
                    }

                    async.parallel(fns, function (err, results) {
                        $scope.isHumDownloading = false;

                        var data = [];

                        results.forEach(function (singleResultArr) {
                            singleResultArr.forEach(function (res) {
                                data.push({
                                    x: parseInt(res.timestamp),
                                    y: parseFloat(res.humidity)
                                });
                            });
                        });

                        var modalInstance = $modal.open({
                            templateUrl: 'partials/history.html',
                            controller: 'HistoryController',
                            size: 'lg',
                            resolve: {
                                items: function () {
                                    return data;
                                },
                                suffix: function() { return '%'},
                                color: function() { return '#EE7600'},
                                metric: function() { return 'Humidity'},
                                renderer: function() { return 'area'}
                            }
                        });
                    });
                };

                $scope.currentShipment = {};
            }])
    .controller("LightController",
        ['$scope', '$modal', '$http', 'Notifications', 'SensorData', 'ConfigData',
            function ($scope, $modal, $http, Notifications, SensorData, ConfigData) {

                $scope.currentLight = 0;

                $scope.subscribe = function (topic, listener, random) {
                    SensorData.subscribe(topic, listener, random);
                };

                $scope.unsubscribe = function (topic) {
                    SensorData.unsubscribe(topic);
                };

                $scope.getDesc = function (pkgId) {
                    return ConfigData.getDesc(pkgId);
                };
                $scope.getRecentData = function (pkgId, metric, startTime, cb) {
                    SensorData.getRecentData(pkgId, metric, startTime, new Date().getTime(), 50, cb);
                };

                $scope.isLightDownloading = false;

                $scope.showLightHistory = function () {
                    if (!$scope.currentShipment.pkgId) {
                        alert("You must choose a shipment!");
                        return;
                    }
                    $scope.isLightDownloading = true;

                    var pointCount = 50;
                    var now = new Date().getTime();
                    var msInDay = (24 * 60 * 60 * 1000);
                    var timeInc = Math.floor(msInDay / pointCount);
                    var startTime = now - msInDay;

                    function getPoint(pkgId, metric, startTime, endTime, cb) {
                        SensorData.getRecentData(pkgId, metric, startTime, endTime, 1, cb);
                    }

                    var fns = [];
                    for (var i = startTime; i < now; i += timeInc) {
                        (function (foo) {
                            fns.push(function (async_callback) {
                                getPoint($scope.currentShipment.pkgId, 'light', foo, foo + timeInc, function (data) {
                                    async_callback(null, data);
                                });
                            });
                        })(i);
                    }

                    async.parallel(fns, function (err, results) {
                        $scope.isLightDownloading = false;

                        var data = [];

                        results.forEach(function (singleResultArr) {
                            singleResultArr.forEach(function (res) {
                                data.push({
                                    x: parseInt(res.timestamp),
                                    y: parseFloat(res.light)
                                });
                            });
                        });

                        var modalInstance = $modal.open({
                            templateUrl: 'partials/history.html',
                            controller: 'HistoryController',
                            size: 'lg',
                            resolve: {
                                items: function () {
                                    return data;
                                },
                                suffix: function() { return 'lux'},
                                color: function() { return '#FFE303'},
                                metric: function() { return 'Light'},
                                renderer: function() { return 'area'}
                            }
                        });
                    });
                };

                $scope.currentShipment = {};
            }])
    .controller("AlertListController",
        ['$timeout', '$scope', '$http', 'Notifications', 'SensorData', 'Alerts',
            function ($timeout, $scope, $http, Notifications, SensorData, Alerts) {

                $scope.alerts = Alerts.getAlerts();

                $scope.$on('alert', function (event, alert) {
                    $scope.alerts = Alerts.getAlerts();
                });

                Alerts.addAlert("system", "system", "info", "Startup", "Fetching shipments...");
                Alerts.addAlert("system", "system", "info", "Startup", "Initializing Sensor Telemetry...");
                Alerts.addAlert("system", "system", "success", "System Initialized", "System is Ready");


                $scope.getAlertCount = function (pkgId, type) {
                    if ($scope.alerts == null) {
                        return 0;
                    }
                    return $scope.alerts.filter(function (alert) {
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
        ['$timeout', '$scope', '$http', 'Notifications', "SensorData", "NgMap", "APP_CONFIG",
            function ($timeout, $scope, $http, Notifications, SensorData, NgMap, APP_CONFIG) {
                $scope.addListener = function (l) {
                    SensorData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    SensorData.removeListener(l);
                };

                $scope.mapsUrl = 'https://maps.googleapis.com/maps/api/js?key=' + APP_CONFIG.GOOGLE_MAPS_API_KEY;

                var timers = [];

                $scope.$on('selectedShipment', function (event, arg) {
                    timers.forEach(function (timer) {
                        $timeout.cancel(timer);
                    });
                    timers = [];

                    var directionsDisplay = new google.maps.DirectionsRenderer();
                    var directionsService = new google.maps.DirectionsService();

                    var request = {
                        origin: arg.fromAddress,
                        destination: arg.toAddress,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                    };
                    directionsService.route(request, function (response, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response);
                            NgMap.getMap().then(function (map) {
                                directionsDisplay.setMap(map);

                                var st = $timeout(function () {
                                    map.markers.cp.setMap(null);
                                    var steps = directionsDisplay.directions.routes[0].legs[0].steps;
                                    var totalsteps = steps.length;
                                    var curStepIdx = Math.floor(totalsteps * 0.2);
                                    var curStep = steps[curStepIdx];

                                    map.markers.cp.setMap(map);
                                    map.markers.cp.setPosition(curStep.start_location);

                                    function movecontainer(marker, dlat, dlng, index, total, delay) {
                                        var t = $timeout(function () {
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
                                            var t2 = $timeout(function () {
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
                                }, 1000);
                                timers.push(st);

                            });
                        } else {
                            Notifications.error('Unable to display directions');
                        }
                    });
                });


            }])
    .controller("ShipListController",
        ['$rootScope', '$scope', '$http', 'Notifications', "ConfigData", "SensorData", "Alerts",
            function ($rootScope, $scope, $http, Notifications, ConfigData, SensorData, Alerts) {
                $scope.addListener = function (l) {
                    ConfigData.addListener(l);
                };
                $scope.removeListener = function (l) {
                    ConfigData.removeListener(l);
                };

                $scope.getAlertCount = function (pkgId, type) {
                    if ($scope.shipalerts == null) {
                        return 0;
                    }
                    var count = $scope.shipalerts.filter(function (alert) {
                        if (alert == null) return false;
                        return ((alert.pkgId == pkgId) && (alert.type == type));
                    }).length;

                    return count;
                };

                $scope.shipments = ConfigData.getCurrentShipments();
                $scope.selectedShipment = null;
                $scope.shipalerts = [];

                $scope.isAlerted = function (pkgId) {

                    for (var i = 0; i < $scope.shipments.length; i++) {
                        var ship = $scope.shipments[i];
                        if (ship.pkgId == pkgId && ship.indicator) {
                            return ship.indicator;
                        }
                    }
                    return false;
                };

                $scope.clearAlert = function (shipment) {
                    if (confirm("Click OK to clear this Alert.")) {
                        var topic = shipment.pkgId.replace('assets', 'notification');
                        var payload = {
                            metrics: {
                                metric: [
                                    {
                                        name: 'red',
                                        type: 'boolean',
                                        value: false
                                    },
                                    {
                                        name: 'green',
                                        type: 'boolean',
                                        value: false
                                    }
                                ]
                            }
                        };

                        SensorData.publish(topic, payload, function () {
                            $scope.selectedShipment.indicator = undefined;
                            ConfigData.saveShipments();
                        }, function (err) {
                            Notifications.error(err.statusText + ": " + err.data.message);
                        });
                    }
                };

                $scope.isSelected = function (shipment) {
                    if (!$scope.selectedShipment) {
                        return false;
                    }
                    return $scope.selectedShipment.pkgId == shipment.pkgId;
                };

                function notificationListener(data) {

                    var shipment = null;
                    var origId = data.pkgId.replace('notification', 'assets');
                    if (origId == $scope.selectedShipment.pkgId) {
                        shipment = $scope.selectedShipment;
                    } else {

                        $scope.shipments.forEach(function(shipObj) {
                            if (shipObj.pkgId == origId) {
                                shipment = shipObj;
                            }
                        });
                    }

                    if (shipment == null) {
                        // we know of no shipment that matches the id from the data message
                        return;
                    }
                    if (data.red) {
                        Alerts.addAlert(shipment.pkgId, shipment.name, "danger", "Indicator", "RED Sensor Indicator");
                        shipment.indicator = 'red';
                    } else if (data.green) {
                        Alerts.addAlert(shipment.pkgId, shipment.name, "success", "Indicator", "GREEN Sensor Indicator");
                        shipment.indicator = 'green';
                    } else {
                        shipment.indicator = undefined;
                    }
                    if (!shipment.randomData) {
                        ConfigData.saveShipments();
                    }

                    $scope.$apply();
                }

                $scope.selectShipment = function (shipment) {
                    if ($scope.selectedShipment && (shipment.pkgId == $scope.selectedShipment.pkgId)) {
                        return;
                    }
               //   SensorData.unsubscribeAll();
                    $scope.selectedShipment = shipment;
                    $rootScope.$broadcast('selectedShipment', shipment);
                    SensorData.subscribe(shipment.pkgId.replace('assets', 'notification'), notificationListener, shipment.randomData);

                };

                $scope.removeShipment = function (e, shipment) {
                    if (confirm("Click OK to mark delivered and remove from shipping list")) {
                        ConfigData.removeShipment(shipment, function () {
                            Notifications.success("Removed shipment " + shipment.name);
                        }, function (err) {
                            Notifications.error("Error removing shipment: " + err);
                        });
                    }
                    e.stopPropagation();
                };

                // TODO: alerts should come from server eventually...
                $scope.$on('alert', function (event, alert) {
                    $scope.shipalerts = Alerts.getAlerts();
                });

                ConfigData.addListener(function () {
                    $scope.shipments = ConfigData.getCurrentShipments();
                });

            }])

    .controller("HeaderController",
        ['$scope', '$location', '$http', 'Notifications', 'ConfigData',
            function ($scope, $location, $http, Notifications, ConfigData) {
                $scope.userInfo = {
                    fullName: "John Q. Shipper"
                };

                $scope.shipmentCount = ConfigData.getCurrentShipments().length;
                $scope.$watch(function () {
                    return ConfigData.getCurrentShipments().length;
                }, function (newVal, oldVal) {
                    $scope.shipmentCount = newVal;
                });

            }]);
