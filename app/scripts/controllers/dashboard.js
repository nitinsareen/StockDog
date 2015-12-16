'use strict';

/**
 * @ngdoc function
 * @name stockDogApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the stockDogApp
 */
 angular.module('stockDogApp')
 .controller('DashboardCtrl', function ($scope, WatchlistService, QuoteService) {
	// [1] Initializations
	var unregisterHandlers = [];
	$scope.watchlists = WatchlistService.query();
	$scope.cssStyle = 'height:300px;';
	var formatters = {
		number: [
		{
			columnNum: 1,
			prefix: '$'
		}
		]
	};
	// [2] Helper: Update chart objects
	var updateCharts = function () {
	// Donut chart
	var donutChart = {
		type: 'PieChart',
		displayed: true,
		data: [['Watchlist', 'Market Value']],
		options: {
			title: 'Market Value by Watchlist',
			legend: 'none',
			pieHole: 0.4
		},
		formatters: formatters
	};
	// Column chart
	var columnChart = {
		type: 'ColumnChart',
		displayed: true,
		data: [['Watchlist', 'Change', { role: 'style' }]],
		options: {
			title: 'Day Change by Watchlist',
			legend: 'none',
			animation: {
				duration: 1500,
				easing: 'linear'
			}
		},
		formatters: formatters
	};
	// [3] Push data onto both chart objects
	_.each($scope.watchlists, function (watchlist) {
		donutChart.data.push([watchlist.name, watchlist.marketValue]);
		columnChart.data.push([watchlist.name, watchlist.dayChange,
			watchlist.dayChange < 0 ? 'Red' : 'Green']);
	});
	$scope.donutChart = donutChart;
	$scope.columnChart = columnChart;
	};
	// [4] Helper function for resetting controller state
	var reset = function () {
	// [5] Clear QuoteService before registering new stocks
	QuoteService.clear();
	_.each($scope.watchlists, function (watchlist) {
		_.each(watchlist.stocks, function (stock) {
			QuoteService.register(stock);
		});
	});
	// [6] Unregister existing $watch listeners before creating new ones
	_.each(unregisterHandlers, function(unregister) {
		unregister();
	});
	_.each($scope.watchlists, function (watchlist) {
		var unregister = $scope.$watch(function () {
			return watchlist.marketValue;
		}, function () {
			recalculate();
		});
		unregisterHandlers.push(unregister);
	});
	};
	// [7] Compute the new total MarketValue and DayChange
	var recalculate = function () {
		$scope.marketValue = 0;
		$scope.dayChange = 0;
		_.each($scope.watchlists, function (watchlist) {
			$scope.marketValue += watchlist.marketValue ?
			watchlist.marketValue : 0;
			$scope.dayChange += watchlist.dayChange ?
			watchlist.dayChange : 0;
		});
		updateCharts();
	};
	// [8] Watch for changes to watchlists.
	$scope.$watch('watchlists.length', function () {
		reset();
	});
});
