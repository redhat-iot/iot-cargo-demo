'use strict';


angular.module('app').directive('shipList', function () {


	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/shiplist.html',
		controller: 'ShipListController',
	}
});
