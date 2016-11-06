var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var busSchema = new Schema({
  bus_number: Number,
  serves: [String],
  route: {
    am: Array,
    pm: Array
  },
  changes_at_school: {
    type: String,
    default: "none"
  }
});

// make everything required that is not explicitly set to not required
for (var i in busSchema.paths) {
  var attribute = busSchema.paths[i];

  if (attribute.isRequired == undefined) {
    attribute.required(true);
  }
}

// export the model
var Bus = module.exports = mongoose.model('bus', busSchema);