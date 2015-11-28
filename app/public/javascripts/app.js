angular
  .module('mteam.app', [
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker'
  ])
  .run(function($interval, mapService) {
    mapService.getBixiStations();
  })
  .value('google', window.google)
  .value('moment', window.moment);
