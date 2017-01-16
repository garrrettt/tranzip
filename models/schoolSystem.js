var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schoolSystemSchema = new Schema({
  school_system_full_name: String,
  school_system_code: String,
  username: String,
  password: String,
  schools: [{
    name: String,
    grade_range: String // "elementary", "middle","high"
  }]

});

// make everything required that is not explicitly set to not required
for (var i in schoolSystemSchema.paths) {
  var attribute = schoolSystemSchema.paths[i];

  if (attribute.isRequired == undefined) {
    attribute.required(true);
  }
}

module.exports = schoolSystemSchema;