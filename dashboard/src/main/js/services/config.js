'use strict';

angular.module('app')

.factory('ConfigData', ['$http', '$q', '$websocket', function($http, $q, $websocket) {
	var listeners = [], factory = {}, dataStream = $websocket('ws://localhost:8081/config'), configData = [];

	dataStream.onMessage(function(message) {
		var data = JSON.parse(message.data);
		configData = data;
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
		return configData;
	};

	factory.reset = function() {
		configData = [];
	};

	return factory;
}]);
