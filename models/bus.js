var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var busSchema = new Schema({
  bus_number: Number,
  am: {
    route: {
      type: Array,
      required: false
    },
    serves: [String],
    changes_at_school: {
      type: Array,
      required: false
    }
  },
  pm: {
    route: {
      type: Array,
      required: false
    },
    serves: [String],
    changes_at_school: {
      type: Array,
      required: false
    }
  }
});

// make everything required that is not explicitly set to not required
for (var i in busSchema.paths) {
  var attribute = busSchema.paths[i];

  if (attribute.isRequired == undefined) {
    attribute.required(true);
  }
}

module.exports = busSchema;