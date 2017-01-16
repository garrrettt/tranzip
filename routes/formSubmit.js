var express = require('express');
var router = express.Router();
var busSchema = require('../models/bus');
var mongoose = require('mongoose');
var Bus = mongoose.model('bcs_buses', busSchema, 'bcs_buses'); // currently defaults to the county schools since only 1 school system is signed up

var closestDistance = require('./util');

router.post('/', function(req, res) {

  // Get data from the AJAX request
  var lat = req.body.coords.lat;
  var lng = req.body.coords.lng;
  var userCoords = [lat, lng];
  var school = req.body.school;

  // to return at the end of the function
  var am = {
    bus_number: null,
    changes_at_school: "none",
    route: []
  };
  var pm = {
    bus_number: null,
    changes_at_school: "none",
    route: []
  };

  // once the db queries have run, these will be true
  var PMready = false;
  var AMready = false;

  // we'll set this to true once we find something
  var amBusFound = false;
  var pmBusFound = false;

  Bus.find({'pm.serves': school}, function(err, buses) {
    if (err) {
      PMready = true;
    } else if (buses.length == 0) {
      PMready = true;
    } else {
      // looks like we found something, so...
      pmBusFound = true;

      // Mongo returns a weird non-json type object, but it is translatable to JSON
      var busesAsAString = JSON.stringify(buses);
      var busesJSON = JSON.parse(busesAsAString);

      var allPMRoutes = [];

      for (var i=0; i < busesJSON.length; i++) {

        // add pm route coords
        for (var j=0; j < busesJSON[i].pm.route.length; j++) {
          allPMRoutes.push(busesJSON[i].pm.route[j].coords);
        }


        var PMclosestPoint = closestDistance(userCoords, allPMRoutes);

        var indexWithinPMBusesArray;

        for (var i=0; i < busesJSON.length; i++) {
          // if closestPoint is contained within the pm route array
          for (var j=0; j < busesJSON[i].pm.route.length; j++) {
            console.log(busesJSON[i].pm.route[j].coords.lat);
            if (busesJSON[i].pm.route[j].coords.lat == PMclosestPoint.lat && busesJSON[i].pm.route[j].coords.lng == PMclosestPoint.lng) {

              pm.bus_number = busesJSON[i].bus_number;
              indexWithinPMBusesArray = i;

              if (busesJSON[i].pm.changes_at_school.length == 0) {
                pm.changes_at_school = "none";
              } else {
                for (var k = 0; k < busesJSON[i].pm.changes_at_school.length; k++) {
                  if (busesJSON[i].pm.changes_at_school[k].students_going_to == school) {
                    pm.changes_at_school = busesJSON[i].pm.changes_at_school[k].change_at;
                    console.log(busesJSON[i].pm.changes_at_school[k])
                  } else {
                    pm.changes_at_school = "none";
                  }
                }
              }

              break;
            }
          }
        }
      }

      for (var i=0; i < busesJSON[indexWithinPMBusesArray].pm.route.length; i++) {
        pm.route.push(busesJSON[indexWithinPMBusesArray].pm.route[i].coords);
      }

      PMready = true;

      // if am and pm query is complete, send the results to the user
      if (AMready && PMready) {
        res.send({
          am_bus_found: amBusFound,
          pm_bus_found: pmBusFound,
          am_bus_number: am.bus_number,
          pm_bus_number: pm.bus_number,
          bus_route: {
            am: am.route,
            pm: pm.route
          },
          am_changes_at_school: am.changes_at_school,
          pm_changes_at_school: pm.changes_at_school
        });
      }
    }
  });

  // Find all buses that serve where the user goes
  Bus.find({'am.serves': school}, function(err, buses) {
    if (err) {
      AMready = true;
    } else if (buses.length == 0) {
      AMready = true;
    } else {

      // since we found something (a bus)
      amBusFound = true;

      // Convert to string because `buses` is wrapped in quotes
      var jsonString = JSON.stringify(buses);
      // Convert to JSON
      var busesJSON = JSON.parse(jsonString);

      var allAMRoutes = [];

      // First loops through each bus, then loops through every waypoint in each bus' route
      for (var i = 0; i < busesJSON.length; i++) {

        // add am route coords
        for (var j = 0; j < busesJSON[i].am.route.length; j++) {
          allAMRoutes.push(busesJSON[i].am.route[j].coords);
        }
      }

      // Gives closest point of any of the routes in all buses queried
      var AMclosestPoint = closestDistance(userCoords, allAMRoutes);

      // to locate the bus again after doing our waypoint search
      var indexWithinAMBusesArray;

      // get the bus number, route, and see if the user's bus changes at a school
      for (var i = 0; i < busesJSON.length; i++) {
        // if closestPoint is contained within the am route array
        for (var j = 0; j < busesJSON[i].am.route.length; j++) {
          if (busesJSON[i].am.route[j].coords.lat == AMclosestPoint.lat && busesJSON[i].am.route[j].coords.lng == AMclosestPoint.lng) {

            am.bus_number = busesJSON[i].bus_number;
            indexWithinAMBusesArray = i;

            console.log(busesJSON[i].am.changes_at_school.length == 0);

            if (busesJSON[i].am.changes_at_school.length == 0) {
              am.changes_at_school = "none";
            } else {
              for (var k = 0; k < busesJSON[i].am.changes_at_school.length; k++) {
                if (busesJSON[i].am.changes_at_school[k].students_going_to == school) {
                  am.changes_at_school = busesJSON[i].am.changes_at_school[k].change_at;
                } else {
                  am.changes_at_school = "none";
                }
              }
            }

            break;
          }
        }
      }

      // Finally, get all the coords within the specific bus
      for (var i = 0; i < busesJSON[indexWithinAMBusesArray].am.route.length; i++) {
        am.route.push(busesJSON[indexWithinAMBusesArray].am.route[i].coords);
      }

      AMready = true;

    }

    // if am and pm query is complete, send the results to the user
    if (AMready && PMready) {
      res.send({
        am_bus_found: amBusFound,
        pm_bus_found: pmBusFound,
        am_bus_number: am.bus_number,
        pm_bus_number: pm.bus_number,
        bus_route: {
          am: am.route,
          pm: pm.route
        },
        am_changes_at_school: am.changes_at_school,
        pm_changes_at_school: pm.changes_at_school
      });
    }

  });
});

module.exports = router;