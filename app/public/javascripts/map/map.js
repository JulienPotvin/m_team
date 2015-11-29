angular
  .module('mteam.app')
  .directive('map', function() {
    return {
      restrict: 'E',
      templateUrl: '/javascripts/map/map.html',
      replace: true,
      controller: 'MapCtrl',
      scope: {
        dynamicMode: '='
      },
      controllerAs: 'vm',
      bindToController: true,
      link: function(scope, element, attrs, ctrl) {
        ctrl.init();
      }
    };
  })
  .controller('MapCtrl', function($q, $interval, _, google, stationsService, mapService) {
    var vm = this;

    console.log(vm.dynamicMode);

    vm.init = function() {
      var montreal = new google.maps.LatLng(45.4875794, -73.6222646);

      vm.map = new google.maps.Map(document.getElementById('map'), {
        center: montreal,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.TERRAIN
      });

      vm.stationsService = stationsService;

      var a = stationsService.getBixiStations();
      var b = stationsService.getBixiFlow();

      $q.all([a, b]).then(function(values) {
        mapService.drawStationsCircles(values[0], vm.map);
      });

      vm.mapService = mapService;
    };

    vm.play = function() {
      if (vm.playPromise) {
        return;
      }

      vm.playPromise = $interval(mapService.increaseHour, 1000);
    };

    vm.pause = function() {
      $interval.cancel(vm.playPromise);
      vm.playPromise = null;
    };

    vm.next = function() {
      mapService.increaseHour();
    };

    vm.previous = function() {
      mapService.decreaseHour();
    }
  })
  .service('mapService', function($, $interval, $rootScope, $compile, stationsService) {
    this.currentHour = 0;
    this.circles = {};
    var self = this;

    this.increaseHour = function() {
      self.currentHour++;

      if (self.currentHour >= 24) {
        self.currentHour = 0;
      }

      self.updateCircles(stationsService.stations);
    };

    this.decreaseHour = function() {
      self.currentHour--;

      if (self.currentHour < 0) {
        self.currentHour = 23;
      }

      self.updateCircles(stationsService.stations);
    };

    this.updateCircles = function(stations) {
      _.each(stations, function(s) {
        var circle = this.circles[s.id];
        var netFlow = this.getStationFlowForHour(s, this.currentHour);

        circle.setOptions({
          fillColor: this.getCircleColor(netFlow),
          radius: this.getCircleRadius(netFlow)
        })
      }, self);
    };

    this.drawStationsCircles = function(stations, map) {
      _.each(stations, function(s, i) {
        var center = {
          lat: s.lat,
          lng: s.long
        };

        var netFlow = this.getStationFlowForHour(s, this.currentHour);

        var circle = new google.maps.Circle({
          strokeColor: '#FFFFFF',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: self.getCircleColor(netFlow),
          fillOpacity: 0.75,
          map: map,
          center: center,
          data: {
            station: s
          },
          radius: self.getCircleRadius(netFlow)
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

    this.getStationFlowForHour = function(station, hour) {
      var object = _.first(_.where(stationsService.flow[station.id], { hour: hour }));

      if (!object) {
        return null;
      } else {
        return object.netFlow;
      }
    };

    this.getCircleRadius = function(netFlow) {
      var radiusMultiplier = 300;
      var defaultRadius = 100;
      var radius;

      if (!netFlow) {
        return defaultRadius;
      }

      radius = Math.abs(Math.floor(netFlow / 5 * radiusMultiplier));

      if (radius < defaultRadius) {
        radius = defaultRadius;
      }

      if (radius > radiusMultiplier) {
        radis = radiusMultiplier;
      }

      return radius;
    };

    this.getCircleColor = function(netFlow) {
      if (!netFlow) {
        return '#532B72';
      }

      // console.log('At ' + hour + ', station id: ' + station.id + ' has a flow of: ' + netFlow);

      if (netFlow <= -0.25) {
        return '#2D4671'; /* blue */
      } else if (netFlow > -0.25 && netFlow < 0.5) {
        return '#532B72'; /* purple */
      } else {
        return '#AA3C39'; /* red */
      }
    };
  });
