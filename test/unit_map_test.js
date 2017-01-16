var supertest = require('supertest');
var api = supertest('http://0.0.0.0:8080');

describe('Map', function() {
  it('should return a 200 response', function(done) {
    api.get('/')
      .expect(200, done);
  });
});