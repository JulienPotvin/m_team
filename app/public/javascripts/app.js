angular
  .module('mteam.app', [
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker'
  ])
  .run(function($interval, stationsService) {
    stationsService.getBixiStations();
  })
  .value('$', window.$)
  .value('_', window._)
  .value('google', window.google)
  .value('moment', window.moment);
