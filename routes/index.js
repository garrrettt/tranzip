var express = require('express');
var router = express.Router();
var schoolSystemSchema = require('../models/schoolSystem');
var mongoose = require('mongoose');

router.get('/', function(req, res) {
  var SchoolSystem = mongoose.model("schoolSystems", schoolSystemSchema, "schoolSystems");
  var schoolsInSystem = [];

  // for now defaults to Blount County Schools
  SchoolSystem.find({ school_system_code: 'bcs' }, {_id: 0, __v: 0}, function(err, schoolSystem) {
    for (var i=0; i < schoolSystem[0].schools.length; i++) {
      schoolsInSystem.push(schoolSystem[0].schools[i]); // includes name and grade range (i.e. 'elementary')
    }

    res.render('index', {
      schoolsInSystem: schoolsInSystem,
      message: req.flash(req.session['success']), // if we have a confirmation message, send it
      loggedIn: req.isAuthenticated()
    });
  });
});

router.get('/about', function(req, res) {
  var SchoolSystem = mongoose.model("schoolSystems", schoolSystemSchema, "schoolSystems");
  var schoolsInSystem = [];

  // for now defaults to Blount County Schools
  SchoolSystem.find({ school_system_code: 'bcs' }, {_id: 0, __v: 0}, function(err, schoolSystem) {
    for (var i=0; i < schoolSystem[0].schools.length; i++) {
      schoolsInSystem.push(schoolSystem[0].schools[i]); // includes name and grade range (i.e. 'elementary')
    }

    res.render('about', {
      schoolsInSystem: schoolsInSystem,
      message: req.flash(req.session['success']), // if we have a confirmation message, send it
      loggedIn: req.isAuthenticated()
    });
  });
});

router.get('/privacy', function(req, res) {
  res.render('privacy');
});

router.get('/report', function(req, res) {
  res.redirect('https://docs.google.com/forms/d/e/1FAIpQLSc2XedGuaoCAaAiWToxBtAGgS0NzofoDJ68JwnrPvDTj6XHDA/viewform?c=0&w=1');
});

module.exports = router;