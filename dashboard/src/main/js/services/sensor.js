'use strict';

angular.module('app')

.factory('SensorData', ['$http', '$q', '$websocket', function($http, $q, $websocket) {
	var listeners = [], factory = {}, dataStream = $websocket('ws://localhost:8081/stream'), sensorData = [];

	dataStream.onMessage(function(message) {
		var data = JSON.parse(message.data);
		sensorData.push(data);
		listeners.forEach(function(listener) {
			listener(data);
		});
	});

	factory.addListener = function(listener) {
		listeners.push(listener);
	};

	factory.removeAllListeners = function() {
		listeners = [];
	}
	factory.removeListener = function(listener) {
		listeners = listeners.filter(function(l) {
			return (l != listener);
		});
	};

	factory.getData = function() {
		return sensorData;
	};

	factory.reset = function() {
		sensorData = [];
	};

	return factory;
}]);
