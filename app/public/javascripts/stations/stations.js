angular
  .module('mteam.app')
  .directive('stationInfo', function() {
      return {
        restrict: 'E',
        templateUrl: '/javascripts/stations/stationInfo.html',
        replace: true,
        scope: {
          name: '@',
        },
      };
  })
  .service('stationsService', function(_, $http, $q) {
    this.bounds = {
      min: null,
      max: null
    };

    this.getBixiStations = function(force) {
      var self = this;

      if (!self.stations || force) {
        return $http.get('http://localhost:3000/rest/stations/').then(function(response) {
          self.stations = response.data;

          _.each(self.stations, function(s) {
            if (!this.bounds.min || s.nbEmptyDocks < this.bounds.min) {
              this.bounds.min = s;
            }

            if (!this.bounds.max || s.nbEmptyDocks > this.bounds.max) {
              this.bounds.max = s;
            }
          }, self);
          return self.stations;
        });
      } else {
        var deferred = $q.defer();

        deferred.resolve(self.stations);

        return deferred.promise;
      }
    };

    this.getBixiFlow = function(force) {
      var self = this;

      if (!self.flow || force) {
        return $http.get('http://localhost:3000/rest/flow/').then(function(response) {
          self.flow = response.data;

          console.log(self.flow);

          _.each(self.flow, function(s) {
          }, self);
          return self.flow;
        });
      } else {
        var deferred = $q.defer();

        deferred.resolve(self.flow);

        return deferred.promise;
      }
    };
  });
