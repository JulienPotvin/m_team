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
  .controller('MapCtrl', function(_, $rootScope, $scope, $uibModal, google, stationsService) {
    var vm = this;

    vm.init = function() {
      var montreal = new google.maps.LatLng(45.4875794, -73.6222646);

      vm.map = new google.maps.Map(document.getElementById('map'), {
        center: montreal,
        zoom: 11
      });

      vm.stationsService = stationsService;

      stationsService.getBixiStations().then(function(stations) {
        _.each(stations, function(s) {
          var marker = new google.maps.Marker({
            position: {
              lat: s.lat,
              lng: s.long,
            },
            map: vm.map,
            title: s.name
          });
        }, this);
      });
    };
  })
  .service('mapService', function() {
    this.stations = {};
    this.markers = {};
  });
