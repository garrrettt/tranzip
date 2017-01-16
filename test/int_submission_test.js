var expect = require('chai').expect;
var should = require('chai').should();
var supertest = require('supertest');
var api = supertest('http://0.0.0.0:8080');

describe('Submission', function() {
  it("should have lat/lng of user and user's school", function(done) {
    api.post('/submit')
      .set('Accept', 'application/json')
      .send({
        coords: {
          lat: 12.12,
          lng: 12.12
        },
        school: "William Blount High School"
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        should.exist(res.body.am_bus_number);
        should.exist(res.body.pm_bus_number);
        should.exist(res.body.bus_route.am);
        should.exist(res.body.bus_route.pm);
        should.exist(res.body.am_changes_at_school);
        should.exist(res.body.pm_changes_at_school);
        done();
      });
  });
});