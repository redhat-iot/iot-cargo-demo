'use strict';

angular.module('app')

    .factory('SensorData', ['$http', '$q', 'APP_CONFIG', 'Notifications', function ($http, $q, APP_CONFIG, Notifications) {
        var factory = {},
            sockets = [],
            auth = make_base_auth(APP_CONFIG.EDC_USERNAME, APP_CONFIG.EDC_PASSWORD);

        function make_base_auth(user, password) {
            var tok = user + ':' + password;
            var hash = btoa(tok);
            return "Basic " + hash;
        }

        function setFromISO8601(isostr) {
            var parts = isostr.match(/\d+/g);
            return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
        }

        factory.publish = function(topic, payload, onSuccess, onError) {
            $http({
                method: 'POST',
                url: APP_CONFIG.EDC_REST_ENDPOINT + '/messages/publish',
                headers: {
                    'Authorization': auth
                },
                data: {
                    topic: topic,
                    payload: payload
                }

            }).then(function(response) {
                onSuccess();
            }, function (response) {
                onError(response);
            });
        };

        factory.subscribe = function (topic, listener, random) {

            if (random) {
                var interval = setInterval(function () {
                    listener({
                        pkgId: topic,
                        timestamp: new Date().getTime(),
                        ambient: Math.random() * 100,
                        humidity: Math.random() * 100,
                        light: Math.random() * 50
                    });

                }, 1000);
                sockets.push({
                    interval: interval,
                    topic: topic
                });
                return;
            }
            var edcUrl = APP_CONFIG.EDC_REST_ENDPOINT + '/streams/subscribe.json?';

            edcUrl += ('topic=' + topic);

            edcUrl += '&fetch=all';

            var request = {
                url: edcUrl,
                contentType: 'application/json',
                transport: 'long-polling',
                fallbackTransport: 'streaming',
                reconnectInterval: 1000,
                pollingInterval: 1000,
                enableXDR: true,
                withCredentials: true,
                dropHeaders: false,
                attachHeadersAsQueryString: false,
                executeCallbackBeforeReconnect: false,
                timeout: 60000,
                headers: {Authorization: auth}
            };

            request.onMessage = function (response) {

                var responseBody = response.responseBody; //JSON string
                var msg = atmosphere.util.parseJSON(responseBody);
                
                var timestamp = setFromISO8601(msg.receivedOn);
                var topic = msg.topic;

                var dataObj = {
                    pkgId: topic,
                    timestamp: timestamp.getTime()
                };

                msg.payload.metrics.metric.forEach(function (metric) {
                    if (metric.type == 'boolean') {
                        metric.value = (metric.value.toLowerCase() == 'true');
                    } else if (metric.type == 'int' || metric.type == 'long') {
                        metric.value = parseInt(metric.value);
                    } else if (metric.type == 'double') {
                        metric.value = parseFloat(metric.value);
                    }
                    dataObj[metric.name.toLowerCase()] = metric.value;
                });

                listener(dataObj);
            };
            
            sockets.push({
                socket: atmosphere.subscribe(request),
                topic: topic
            });


            // dataStream.onMessage(function(message) {
            // 	var data = JSON.parse(message.data);
            // 	sensorData.push(data);
            // 	listeners.forEach(function(listener) {
            // 		listener(data);
            // 	});
            // });
        };

        factory.unsubscribe = function (topic) {
            
            sockets = sockets.filter(function (socket) {
                if (socket.topic == topic) {
                    if (socket.interval) {
                        clearInterval(socket.interval);
                    }
                    return false;
                } else {
                    return true;
                }
            })
        };

        factory.unsubscribeAll = function () {
            atmosphere.unsubscribe();
            sockets.forEach(function (socket) {
                if (socket.interval) {
                    clearInterval(socket.interval);
                }
            });

            sockets = [];
        };

        factory.getRecentData = function (pkgId, metric, startTime, endTime, limit, cb) {
            $http({
                method: 'GET',
                url: APP_CONFIG.EDC_REST_ENDPOINT + '/messages/searchByTopic?' +
                'topic=' + pkgId +
                '&startDate=' +startTime +
                '&endDate=' +endTime +
                '&limit=' + limit,
                headers: {
                    'Authorization': auth
                }
            }).then(function successCallback(response) {


                var recentData = [];
                if (!response.data.message) {
                    cb([]);
                    return;
                }
                response.data.message.forEach(function (msg) {
                    var timestamp = setFromISO8601(msg.receivedOn);
                    msg.payload.metrics.metric.forEach(function (metricObj) {
                        if (metricObj.name.toLowerCase() == metric) {
                            var dataObj = {
                                timestamp: timestamp.getTime()
                            };
                            dataObj[metricObj.name.toLowerCase()] = metricObj.value;
                            recentData.push(dataObj);
                        }
                    });
                });

                cb(recentData);
            }, function errorCallback(response) {
                Notifications.error("error fetching recent data: " + response.statusText);
            });


        };


        return factory;
    }]);
