var express = require('express');
var router = express.Router();
var Bus = require('../models/bus');

router.get('/bus/:number', function(req, res) {
  Bus.find({bus_number: req.params.number}, function(err, bus) {
    if (err) throw err;

    if (!bus.length) {
      res.send("No bus number of " + req.params.number + " was found.  Sorry!")
    } else {
      res.json(bus);
    }
  });
});

router.get('/bus/:number/route', function(req, res) {
  Bus.find({bus_number: req.params.number}, function(err, bus) {
    if (err) throw err;

    if (!bus.length) {
      res.send("No bus number of " + req.params.number + " was found.  Sorry!")
    } else {
      // Convert to string because `buses` is wrapped in an array
      var jsonString = JSON.stringify(bus);
      // Convert to JSON
      var busJSON = JSON.parse(jsonString);

      res.json(busJSON[0].route); // busJSON is wrapped in an array, so index of 0 gets it all
    }
  })
});

module.exports = router;