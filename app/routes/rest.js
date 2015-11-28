var express = require('express');
var router = express.Router();

var stations = require('../json/stations.json');

/* GET users listing. */
router.get('/stations', function(req, res, next) {
  res.json(stations);
});

module.exports = router;
