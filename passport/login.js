var LocalStrategy = require('passport-local').Strategy;
var schoolSystemSchema = require('../models/schoolSystem');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// So that we can search through all of the schools to see who's logging in
var School = mongoose.model('schoolSystems', schoolSystemSchema, 'schoolSystems');

module.exports = function(passport) {
  passport.use('login', new LocalStrategy({
    passReqToCallback: true
  }, function (req, username, password, done) {

    School.find({username: username}, function (err, school) {
      if (school.length == 0) {
        console.log('This user does not exist');
        done(null, false);
      } else if (err) {
        console.log('error');
        done(err);
      } else {
        bcrypt.compare(password, school[0].password, function(err, valid) {
          console.log(valid);
          if (err) {
            done(err);
          } else if (valid) {
            console.log('Success!');

            done(null, school, {message: 'Success!'})
          } else if (!valid) {
            console.log('invalid password');

            done(null, valid)
          }
        });
      }
    })
  }));

};