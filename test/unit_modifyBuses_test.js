var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://0.0.0.0:8080');

describe('Editing routes page', function() {
  it('should return 404 when you enter a wrong bus number', function(done) {
    api.get('/add/bologna')
      .expect(404, done);
  });
});