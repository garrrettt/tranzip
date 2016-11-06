var express = require('express');
var router = express.Router();
var Bus = require('../models/bus');

router.get('/', function(req, res) {
  res.render('index');
});

// Haversine function finds distance between two coords
function haversineDistance(coords1, coords2, isMiles) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var lat1 = coords1[0];
  var lon1 = coords1[1];

  var lat2 = coords2[0];
  var lon2 = coords2[1];

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  if(isMiles) d /= 1.60934;

  return d;
}

function closestDistance(userCoord, route) {
  var distances = [];

  // Push into `distances` the distance from user's address to every waypoint 
  for (var i=0; i < route.length; i++) {
    distances.push(haversineDistance(userCoord, route[i], true));
  }

  var shortestDist = Math.min(...distances);

  // Find where `shortestDist` is within distances
  var index = distances.indexOf(shortestDist);

  // the indexes of `distances` should match up with `route`
  // since we know where `shortestDist` is within `distances` we also know where it is within `route`
  return route[index];
}

router.post('/submit', function(req, res) {

  // Get data from the AJAX request
  var lat = req.body.coords.lat;
  var lng = req.body.coords.lng;
  var userCoords = [lat, lng];
  var school = req.body.school;

  // to return at the end of the function
  var bus_number;
  var bus_route;

  // Find all buses that serve where the user goes
  Bus.find({serves: school}, function(err, buses) {
    if (err) throw err;
    console.log(buses)
    // Convert to string because `buses` is wrapped in an array
    var jsonString = JSON.stringify(buses);
    // Convert to JSON
    var busesJSON = JSON.parse(jsonString);
    console.log(busesJSON);

    // The following process will be done twice to include the PM route
    var amRoutes = [];

    // First loops through each bus, then loops through every waypoint in each bus' route
    for (var i=0; i < busesJSON.length; i++) {
      for (var j=0; j < busesJSON[i]["route"]["am"].length; j++) {
        amRoutes.push(busesJSON[i]["route"]["am"][j]);
      }
    }

    var closestPoint = closestDistance(userCoords, amRoutes); // Gives closest bus route [lat,lng]
    console.log("Closest distance is:  " + closestDistance(userCoords, amRoutes));

    for (var i=0; i < busesJSON.length; i++) {
      // if closestPoint is contained within the am route array
      if (busesJSON[i]["route"]["am"].indexOf(closestPoint) > -1) {
        bus_number = busesJSON[i]["bus_number"];
        bus_route = busesJSON[i]["route"]["am"]
      }
    }

    console.log("Bus " + bus_number);

    // Send the closest point
    res.send(JSON.stringify({
      bus_number: bus_number,
      amRoutes: bus_route
    }));
  });

});

module.exports = router;