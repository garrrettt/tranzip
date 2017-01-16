var schoolSystemSchema = require('../models/schoolSystem');
var login = require('./login');
var mongoose = require('mongoose');

module.exports = function(passport) {
  // search specifically for the school provided
  var School = mongoose.model('schoolSystems', schoolSystemSchema, 'schoolSystems');

  // serializing gives a user a unique cookie to establish a persistent connection
  passport.serializeUser(function(school, done) {
    console.log('Serializing user: ' + school[0]._id);
    console.log(school[0]._id);


    done(null, school[0]._id);
  });

  passport.deserializeUser(function(id, done) {
    School.findById(id, function(err, school) {
      console.log('deserializing school: ' + school._id);
      done(err, school._id);
    });
  });

  // Setting up a custom Passport Strategy for login
  login(passport);

};