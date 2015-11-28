var express = require('express');
var router = express.Router();

var stations = require('../json/stations.json');
var demand = require('../json/demand.json');


/* GET users listing. */
router.get('/stations', function(req, res, next) {
  res.json(stations);
});

router.get('/demand', function(req, res, next) {
  res.json(demand);
});

module.exports = router;
