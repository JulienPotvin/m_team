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
  .service('mapService', function($, $interval, $rootScope, $compile, stationsService) {
    this.currentHour = 0;
    this.circles = {};
    var self = this;

    this.increaseHour = function() {
      _.each(stationsService.stations, function(s) {
        var circle = this.circles[s.id];

        circle.setOptions({
          fillColor: this.getCircleColor(s, this.currentHour),
          radius: this.getCircleRadius(s, this.currentHour)
        })

      }, self);

      self.currentHour++;

      if (self.currentHour >= 24) {
        self.currentHour = 0;
      }
    };

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
          fillOpacity: 0.75,
          map: map,
          center: center,
          data: {
            station: s
          }
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
      return _.first(_.where(stationsService.flow[station.id], { hour: hour }));
    };

    this.getCircleRadius = function(station, hour) {
      var radiusMultiplier = 300;
      var object = this.getStationFlowForHour(station, hour);
      var radius;

      if (!object) {
        return;
      }

      var netFlow = object.netFlow;

      radius = Math.abs(Math.floor(netFlow / 5 * radiusMultiplier));

      if (radius < 100) {
        radius = 100;
      }

      if (radius > radiusMultiplier) {
        radis = radiusMultiplier;
      }

      return radius;
    };

    this.getCircleColor = function(station, hour) {
      var object = this.getStationFlowForHour(station, hour);

      if (!object) {
        console.log('At ' + hour + ', there is no info for station id: ' + station.id);
        return;
      }

      var netFlow = object.netFlow;

      console.log('At ' + hour + ', station id: ' + station.id + ' has a flow of: ' + netFlow);

      if (netFlow <= -0.25) {
        return '#2D4671'; /* blue */
      } else if (netFlow > -0.25 && netFlow < 0.5) {
        return '#532B72'; /* purple */
      } else {
        return '#AA3C39'; /* red */
      }
    };

    $interval(this.increaseHour, 1000, this);
  });
