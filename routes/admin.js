var express = require('express');
var router = express.Router();
var busSchema = require('../models/bus');
var schoolSystemSchema = require('../models/schoolSystem');
var mongoose = require('mongoose');
var SchoolSystem = mongoose.model("schoolSystems", schoolSystemSchema, "schoolSystems");

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // set a redirect point, so that when they login, we'll point them back to that page
  req.session.returnTo = req.path;

  req.session['success'] = 'You need to login to access that page!';
  // if the user is not authenticated then redirect him to the login page
  res.redirect('/admin');
};

router.get('/', function(req, res) {
  res.render('login');
});

module.exports = function(passport) {
  router.post('/login', passport.authenticate('login', {
    failureRedirect: '/admin',
    failureFlash: true
  }), function(req, res) {
    if (req.session.returnTo) {
      res.redirect('/admin/' + req.session.returnTo);
    } else {
      SchoolSystem.find({username: req.body.username}, function(err, schoolSystem) {
        res.redirect('/admin/' + schoolSystem[0].school_system_code);
      });
    }

    delete req.session.returnTo;
  });

  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  router.get('/:school', isAuthenticated, function (req, res) {
    var busNumbers = [];
    var schoolsInSystem = [];

    SchoolSystem.find({}, {_id: 0}, function (err, schoolSystem) {
      for (var i = 0; i < schoolSystem[0].schools.length; i++) {
        schoolsInSystem.push(schoolSystem[0].schools[i].name);
      }

      var Bus = mongoose.model(req.params.school + "_buses", busSchema, req.params.school + "_buses"); // third parameter makes sure mongodb doesn't pluralize the model name

      // get all bus numbers, and package them into admin.ejs
      Bus.find({}, {"bus_number": 1, _id: 0}, function (err, buses) {
        for (var i = 0; i < buses.length; i++) {
          busNumbers.push(buses[i].bus_number);
        }
        console.log(JSON.stringify(schoolsInSystem))
        res.render('admin', {
          busNumbers: busNumbers,
          school: req.params.school,
          schoolsInSystem: JSON.stringify(schoolsInSystem)
        });
      });
    });
  });

  // a little regex at the end to make sure only numbers are allowed
  router.post('/:school/:bus_number(\\d+)', isAuthenticated, function (req, res) {
    var Bus = mongoose.model(req.params.school + "_buses", busSchema, req.params.school + "_buses");

    Bus.find({bus_number: req.params.bus_number}).remove(function (err, results) {
      err ? res.send('err') : res.send('success!');
    });
  });

  router.post('/:school/newbus', isAuthenticated, function (req, res) {
    var Bus = mongoose.model(req.params.school + "_buses", busSchema, req.params.school + "_buses");
    var SchoolSystem = mongoose.model("schoolSystems", schoolSystemSchema, "schoolSystems");
    var schoolsInSystem = [];

    SchoolSystem.find({}, {_id: 0}, function (err, schoolSystem) {
      for (var i = 0; i < schoolSystem[0].schools.length; i++) {
        schoolsInSystem.push(schoolSystem[0].schools[i].name);
      }
    });

    // make sure that they aren't creating a duplicate bus
    if (schoolsInSystem.indexOf(req.body.bus_number) > -1) {
      res.send('err');
    } else {

      Bus.create({
        bus_number: parseInt(req.body.bus_number),
        am: {
          route: [],
          serves: req.body.am.serves,
          changes_at_school: req.body.am.changes_at_school
        },
        pm: {
          route: [],
          serves: req.body.pm.serves,
          changes_at_school: req.body.pm.changes_at_school
        }
      }, function (err, response) {
        err ? res.send('err') : res.send('You successfully created a bus!');
      });

    }
  });

  router.get('/:school/:bus', isAuthenticated, function (req, res) {
    var bus_number = req.params.bus;

    // search specifically for the school provided
    var Bus = mongoose.model(req.params.school + "_buses", busSchema, req.params.school + "_buses");
    var SchoolSystem = mongoose.model("schoolSystems", schoolSystemSchema, "schoolSystems");

    var schoolsInSystem = [];

    SchoolSystem.find({}, {_id: 0}, function (err, schoolSystem) {
      for (var i = 0; i < schoolSystem[0].schools.length; i++) {
        schoolsInSystem.push(schoolSystem[0].schools[i].name);
      }
    });

    var busNumbers = [];

    // get all bus numbers, and package them into admin.ejs
    Bus.find({}, {"bus_number": 1, _id: 0}, function (err, buses) {
      for (var i = 0; i < buses.length; i++) {
        busNumbers.push(buses[i].bus_number);
      }
    });

    // make sure bus number is valid integer
    if (Number.isInteger(parseInt(bus_number))) {
      Bus.find({'bus_number': bus_number}, function (err, buses) {
        if (err) {
          console.log(err);
          res.status(404).render('404');
        } else if (buses.length == 0) {
          console.log("No bus found with that bus number");
          res.status(404).render('404');
        } else {
          // do one final check to make sure the route isn't empty or more than one bus
          if (buses[0] != null && buses.length == 1) {
            var allAMCoordsForSingleBus = [];
            var allAMAddressesForSingleBus = [];
            var allPMCoordsForSingleBus = [];
            var allPMAddressesForSingleBus = [];

            for (var i = 0; i < buses[0].am.route.length; i++) {
              allAMCoordsForSingleBus.push(buses[0].am.route[i].coords);
              allAMAddressesForSingleBus.push(buses[0].am.route[i].address);
            }

            for (var i = 0; i < buses[0].pm.route.length; i++) {
              allPMCoordsForSingleBus.push(buses[0].pm.route[i].coords);
              allPMAddressesForSingleBus.push(buses[0].pm.route[i].address);
            }

            res.render('modifyBuses', {
              AMroute: JSON.stringify(allAMCoordsForSingleBus),
              PMroute: JSON.stringify(allPMCoordsForSingleBus),
              AMaddresses: JSON.stringify(allAMAddressesForSingleBus),
              PMaddresses: JSON.stringify(allPMAddressesForSingleBus),
              schoolsInSystem: schoolsInSystem,
              busNumbers: busNumbers,
              busYouAreEditing: buses.bus_number,
              school: req.params.school
            });
          } else {
            res.status(404).render('404');
          }
        }
      });
    } else {
      res.status(404).render('404');
    }
  });

  router.post('/:school/:bus/confirm', isAuthenticated, function (req, res) {

    // we'll toggle this to false if anything goes wrong
    var successful = true;

    var Bus = mongoose.model(req.params.school + "_buses", busSchema, req.params.school + "_buses");

    var bus_number = req.params.bus;
    var changes = req.body;

    // insert everything in changes.add into the database
    for (var i = 0; i < changes.add.length; i++) {
      if (changes.add[i].AMorPM == 'AM') {
        Bus.findOneAndUpdate(
          {bus_number: bus_number},
          {
            $push: {
              'am.route': {
                coords: changes.add[i].coords,
                address: changes.add[i].address
              }
            }
          },
          function (err, result) {
            if (err) successful = false;

            console.log(result);
          });
      } else if (changes.add[i].AMorPM == 'PM') {
        Bus.findOneAndUpdate(
          {bus_number: bus_number},
          {
            $push: {
              'pm.route': {
                coords: changes.add[i].coords,
                address: changes.add[i].address
              }
            }
          },
          function (err, result) {
            if (err) successful = false;

            console.log(result);
          });
      }
    }

    // insert everything in changes.edit into the database
    for (var i = 0; i < changes.edit.length; i++) {
      var oldLat = parseFloat(changes.edit[i].oldCoords.lat);
      var oldLng = parseFloat(changes.edit[i].oldCoords.lng);

      if (changes.edit[i].AMorPM == 'AM') {
        // find the place where the DB coords and the old coords (before edit) are the same; then update
        Bus.update({'am.route.coords.lat': oldLat, 'am.route.coords.lng': oldLng},
          {
            $set: {
              'am.route.$': {
                coords: {lat: parseFloat(changes.edit[i].coords.lat), lng: parseFloat(changes.edit[i].coords.lng)},
                address: changes.edit[i].newAddress
              }
            }
          },
          function (err, result) {
            if (err) successful = false;

            console.log(result)
          }
        );
      } else if (changes.edit[i].AMorPM == 'PM') {
        Bus.update({'pm.route.coords.lat': oldLat, 'pm.route.coords.lng': oldLng},
          {
            $set: {
              'pm.route.$': {
                coords: {lat: parseFloat(changes.edit[i].coords.lat), lng: parseFloat(changes.edit[i].coords.lng)},
                address: changes.edit[i].newAddress
              }
            }
          },
          function (err, result) {
            if (err) successful = false;

            console.log(result)
          }
        );
      }
    }

    // delete everything listed in changes.delete
    for (var i = 0; i < changes.remove.length; i++) {
      var oldLat = parseFloat(changes.remove[i].coords.lat);
      var oldLng = parseFloat(changes.remove[i].coords.lng);
      console.log(oldLat);
      console.log(oldLng);

      if (changes.remove[i].AMorPM == 'AM') {
        Bus.update({'am.route.coords.lat': oldLat, 'am.route.coords.lng': oldLng},
          {
            $pull: {
              'am.route': {
                coords: {lng: oldLng, lat: oldLat}, // Objects are stored in lng, lat for some reason
                address: changes.remove[i].address
              }
            }
          },
          function (err, result) {
            if (err) successful = false;

            console.log(result)
          }
        );
      } else if (changes.remove[i].AMorPM == 'PM') {
        Bus.update({'pm.route.coords.lat': oldLat, 'pm.route.coords.lng': oldLng},
          {
            $pull: {
              'pm.route': {
                coords: {lng: oldLng, lat: oldLat},
                address: changes.remove[i].address
              }
            }
          },
          function (err, result) {
            if (err) successful = false;

            console.log(result)
          }
        );
      }
    }

    successful ? res.send('success!') : res.send('err')
  });

  return router
};