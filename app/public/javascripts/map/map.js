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
  .controller('MapCtrl', function(_, google, stationsService, mapService) {
    var vm = this;

    vm.init = function() {
      var montreal = new google.maps.LatLng(45.4875794, -73.6222646);

      vm.map = new google.maps.Map(document.getElementById('map'), {
        center: montreal,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.TERRAIN
      });

      vm.stationsService = stationsService;

      stationsService.getBixiStations().then(function(stations) {
        mapService.drawStationsCircles(stations, vm.map);
      });

      stationsService.getBixiFlow().then(function(flow) {
      });
    };
  })
  .service('mapService', function($, $rootScope, $compile, stationsService) {
    this.circles = {};

    this.drawStationsCircles = function(stations, map) {
      _.each(stations, function(s, i) {
        var center = {
          lat: s.lat,
          lng: s.long
        };

        var circle = new google.maps.Circle({
          strokeColor: '#FFFFFF',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: '#FF0000',
          fillOpacity: 0.25,
          map: map,
          center: center,
          data: {
            station: s
          },
          radius: this.getCircleRadius(s)
        });

        circle.addListener('mouseover', function() {
          console.log('entering: ' + this.data.station.name);

          var scope = $rootScope.$new();
          var el = angular.element(`<station-info name="${s.name}"></station-info>`);
          var content = $compile(el)(scope);
          scope.$apply();

          var infowindow = new google.maps.InfoWindow({
            content: el.html(),
            position: center
          });

          this.data.infowindow = infowindow;

          infowindow.open(map, this);
        });

        circle.addListener('mouseout', function() {
          console.log('leaving: ' + this.data.station.name);

          if (this.data.infowindow) {
            this.data.infowindow.close()
            delete this.data.infowindow;
            return;
          }
        });

        this.circles[s.id] = circle;
      }, this);
    };

    this.getCircleRadius = function(station) {
      var max = stationsService.bounds.max.nbEmptyDocks;

      var radius = Math.floor(station.nbEmptyDocks / max * 100);

      if (radius < 10) {
        radius = 10;
      }

      return radius;
    };
  });
