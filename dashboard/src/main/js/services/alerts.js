'use strict';

angular.module('app')

.service('Alerts', ['$rootScope', '$http', '$q', function($rootScope, $http, $q) {

	var alerts = [];

	this.clearAlerts = function() {
		alerts = [];
		console.log("clearing alerts");
		$rootScope.$broadcast('alert', null);
	};

	this.addAlert = function(id, type, header, message, links) {
		var newAlert = {
			pkgId: id ? id : "",
			type: type,
			timestamp: Date.now(),
			header: id ? id : "",
			message: header + ": " + message,
			icon: this.getIconName(type),
			links: links
		};

		alerts.push(newAlert);
		$rootScope.$broadcast('alert', newAlert);
	};
	
	this.getAlerts = function() {
		return alerts;
	};
	
	this.getIconName = function(type) {
		if (type == 'danger') {
			return 'pficon-error-circle-o';
		} else if (type == 'warning') {
			return 'pficon-warning-triangle-o';
		} else if (type == 'info') {
			return 'pficon-info';
		} else if (type == 'success') {
			return 'pficon-ok'
		}
	}
}]);
