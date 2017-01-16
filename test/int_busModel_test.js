var expect = require('chai').expect;
var should = require('chai').should();

// for database
var mongoose = require('mongoose');
mongoose.connect('mongodb://0.0.0.0/buses');
mongoose.Promise = global.Promise;

var busSchema = require('../models/bus');
var Bus = mongoose.model('bcs_buses', busSchema);

describe('Bus model', function() {
  it('should have a bus number, the routes, who the routes serve, and if the bus switches before reaching its destination', function(done) {
    Bus.findOne({}, function(err, bus) {
      should.not.exist(err);
      should.exist(bus);
      should.exist(bus.bus_number);
      expect(bus.bus_number).to.be.a('number');
    });
    done();
  });
  it('should not allow inserting empty data', function(done) {
    var emptyBus = new Bus({});
    emptyBus.validate(function(err) {
      should.exist(err.name);
      done();
    });
  });
});