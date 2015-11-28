angular
  .module('mteam.app')
  .directive('map', function() {
    return {
      restrict: 'E',
      templateUrl: '/javascripts/map/map.html',
      replace: true,
      controller: 'MapCtrl',
      scope: {
        isStoreMode: '='
      },
      controllerAs: 'vm',
      bindToController: true,
      link: function(scope, element, attrs, ctrl) {
        ctrl.init();
      }
    };
  })
  .controller('MapCtrl', function($rootScope, $scope, $uibModal, google, mapService) {
    var vm = this;

    vm.init = function() {
      var montreal = new google.maps.LatLng(45.4875794, -73.6222646);

      vm.map = new google.maps.Map(document.getElementById('map'), {
        center: montreal,
        zoom: 11
      });

      vm.mapService = mapService;

      mapService.getBixiStations().then(function(stations) {
        console.log(stations);
      });
    };
  })
  .service('mapService', function($http, $q) {
    this.stations = {};
    this.markers = {};

    this.getBixiStations = function(force) {
      var self = this;

      if (!self.stations || force) {
        return $http.get('http://localhost:3000/getBixiStations/').then(function(response) {
          self.stations = response.data;
          return self.stations;
        });
      } else {
        var deferred = $q.defer();

        deferred.resolve(self.stations);

        return deferred.promise;
      }
    };
  });
