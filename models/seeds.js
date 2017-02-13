var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var busSchema = require('./bus');
var schoolSystemSchema = require('./schoolSystem');
var Bus = mongoose.model('bcs_buses', busSchema, 'bcs_buses');
var School = mongoose.model('schoolSystems', schoolSystemSchema, 'schoolSystems');

// so that we can hash the password of the seeded school
var bcrypt = require('bcrypt-nodejs');

function createHash(password, callback) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, null, callback);
  });
}

var bcs = new School({
  school_system_full_name: 'Blount County Schools',
  school_system_code: 'bcs',
  username: "tranzip",
  password: "Ch@ng3M3!", // ideally, this wouldn't be set in plain-text
  schools: [
    {
      name: 'William Blount High School',
      grade_range: 'high'
    }, {
      name: 'Carpenters Middle School',
      grade_range: 'middle'
    }, {
      name: 'Lanier Elementary School',
      grade_range: 'elementary'
    }, {
      name: 'Union Grove Middle',
      grade_range: 'middle'
    }, {
      name:'Friendsville Elementary',
      grade_range: 'elementary'
    }]
});

// change the password to a hash and then save BCS to the database
createHash(bcs.password, function(err, hash) {
  if (err) {
    return done(err);
  } else {
    bcs.password = hash;

    bcs.save(function(err, data){
      if (err) console.log(err);
      else console.log(data);
    });
  }
});


var newBus = new Bus({
  bus_number: 3,
  am: {
    route: [
      {
        coords: {lat: 35.611035, lng: -83.951239},
        address: "6361 Happy Valley Loop"
      },
      {
        coords: {lat: 35.615656, lng: -83.947353},
        address: "6210 Happy Valley Loop"
      },
      {
        coords: {lat: 35.616806, lng: -83.943056},
        address: "6103 Happy Valley Loop"
      },
      {
        coords: {lat: 35.614700, lng: -83.948033},
        address: "6240 Happy Valley Loop"
      },
      {
        coords: {lat: 35.610416, lng: -83.954578},
        address: "6452 Happy Valley Road"
      },
      {
        coords: {lat: 35.580460, lng: -83.989006},
        address: "7354 Happy Valley Road"
      },
      {
        coords: {lat: 35.566529, lng: -84.096829},
        address: "4401 Calderwood Hwy"
      }
    ],
    serves: [
      "William Blount High School",
      "Carpenters Middle School",
      "Lanier Elementary School"
    ]
  },
  pm: {
    route: [
      {
        coords: {lat: 35.620207, lng: -84.087865},
        address: "2745 Calderwood Hwy"
      },
      {
        coords: {lat: 35.645450, lng: -84.074289},
        address: "911 Coker Rd"
      },
      {
        coords: {lat: 35.646134, lng: -84.069438},
        address: "5418 Hutton Ridge Rd"
      },
      {
        coords: {lat: 35.643217, lng: -84.098766},
        address: "6127 Hutton Ridge Rd"
      }
    ],
    serves: [
      "Lanier Elementary School"
    ]
  }
});

newBus.save(function(err, data){
  if (err) console.log(err);
  else console.log(data);
});

var newBus = new Bus({
  bus_number: 28,
  am: {
    route: [
      {
        coords: {lat: 35.645329, lng: -84.068154},
        address: "5408 Hutton Ridge Rd"
      },
      {
        coords: {lat: 35.642494, lng: -84.10111},
        address: "684 Brick Mill Road"
      },
      {
        coords: {lat: 35.645328, lng: -84.104651},
        address: "6221 Oris Miller Rd"
      },
      {
        coords: {lat: 35.637612, lng: -84.114654},
        address: "6641 Crye Road"
      },
      {
        coords: {lat: 35.636195, lng: -84.09983},
        address: "901 Brick Mill Road"
      },
      {
        coords: {lat: 35.623241, lng: -84.097996},
        address: "6006 Lanier Rd"
      }
    ],
    serves: [
      "Lanier Elementary School",
      "Carpenters Middle School",
      "William Blount High School"
    ]
  },
  pm: {
    route: [
      {
        coords: {lat: 35.623241, lng: -84.097996},
        address: "6006 Lanier Rd"
      },
      {
        coords: {lat: 35.617757, lng: -84.096082},
        address: "6534 Lee Thompson Lane"
      },
      {
        coords: {lat: 35.615943, lng: -84.094709},
        address: "1523 Brick Mill Road"
      },
      {
        coords: {lat: 35.618975, lng: -84.08864},
        address: "2811 Calderwood Highway"
      }
    ],
    serves: [
      "Lanier Elementary School"
    ],
    changes_at_school: [{
      students_going_to: "William Blount High School",
      change_at: "Lanier Elementary School"
    }]
  }

});

newBus.save(function(err, data){
  if (err) console.log(err);
  else console.log(data);
});

// if you're wondering, everything before this was manually typed
// This was done by creating a bus, and then copying the JSON from the Mongo shell
var newBus = new Bus({
  "bus_number":37,
  "pm":{
    "serves":[
      "William Blount High School",
      "Carpenters Middle School",
      "Lanier Elementary School"
    ],
    "route":[
      {
        "address":"6513 Cannon Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.135247,
          "lat":35.629297
        }
      },
      {
        "address":"1236 Floyd Walker Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.135755,
          "lat":35.6123
        }
      },
      {
        "address":"1182 Floyd Walker Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.137126,
          "lat":35.614399
        }
      },
      {
        "address":"1553 Trigonia Rd",
        "coords":{
          "lng":-84.153391,
          "lat":35.606742
        }
      },
      {
        "address":"803 Trigonia Rd",
        "coords":{
          "lng":-84.181215,
          "lat":35.605433
        }
      },
      {
        "address":"7439 Russell Hollow Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.172303,
          "lat":35.609591
        }
      },
      {
        "address":"542 Lee Shirley Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.15741,
          "lat":35.620669
        }
      },
      {
        "address":"1001 Lee Shirley Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.148097,
          "lat":35.61362
        }
      },
      {
        "address":"7218 Howard School Rd",
        "coords":{
          "lng":-84.149324,
          "lat":35.604749
        }
      },
      {
        "address":"7801 Ray Ln, Maryville, TN, United States",
        "coords":{
          "lng":-84.159118,
          "lat":35.601784
        }
      },
      {
        "address":"7506 Ray Ln",
        "coords":{
          "lng":-84.150534,
          "lat":35.600308
        }
      },
      {
        "address":"7859 Tomotley Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.160452,
          "lat":35.591967
        }
      },
      {
        "address":"5501 U.S. 411, Maryville, TN, United States",
        "coords":{
          "lng":-84.109295,
          "lat":35.663019
        }
      },
      {
        "address":"116 Thompson Bridge Rd, Greenback, TN, United States",
        "coords":{
          "lng":-84.138386,
          "lat":35.645774
        }
      },
      {
        "address":"6429 Howard School Rd",
        "coords":{
          "lng":-84.13419,
          "lat":35.628233
        }
      },
      {
        "address":"6515 Cannon Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.135646,
          "lat":35.629769
        }
      },
      {
        "address":"1236 Floyd Walker Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.135755,
          "lat":35.6123
        }
      },
      {
        "address":"1182 Floyd Walker Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.137126,
          "lat":35.614399
        }
      },
      {
        "address":"1553 Trigonia Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.153391,
          "lat":35.606742
        }
      },
      {
        "address":"803 Trigonia Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.181215,
          "lat":35.605433
        }
      },
      {
        "address":"7211 Howard School Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.149742,
          "lat":35.605451
        }
      },
      {
        "address":"7801 Ray Ln, Maryville, TN, United States",
        "coords":{
          "lng":-84.159118,
          "lat":35.601784
        }
      },
      {
        "address":"7506 Ray Ln, Maryville, TN, United States",
        "coords":{
          "lng":-84.150534,
          "lat":35.600308
        }
      },
      {
        "address":"7859 Tomotley Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.160452,
          "lat":35.591967
        }
      },
      {
        "address":"1517 Tom McCall Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.147449,
          "lat":35.595842
        }
      },
      {
        "address":"2230 Big Gully Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.133938,
          "lat":35.587875
        }
      },
      {
        "address":"7024 Tomotley Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.130568,
          "lat":35.603988
        }
      },
      {
        "address":"7390 Tomotley Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.146896,
          "lat":35.597545
        }
      },
      {
        "address":"7024 Tomotley Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.130568,
          "lat":35.603988
        }
      },
      {
        "address":"6723 Lanier Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.12245,
          "lat":35.610496
        }
      },
      {
        "address":"6300 Lanier Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.107789,
          "lat":35.619941
        }
      },
      {
        "address":"10 Thompson Bridge Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.131147,
          "lat":35.629072
        }
      },
      {
        "address":"698 Thompson Bridge Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.131784,
          "lat":35.62956
        }
      }
    ]
  },
  "am":{
    "changes_at_school":[
      {
        "change_at":"William Blount High School",
        "students_going_to":"Lanier Elementary School"
      }
    ],
      "serves":[
      "William Blount High School",
      "Lanier Elementary School"
    ],
      "route":[
      {
        "address":"6513 Cannon Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.135247,
          "lat":35.629297
        }
      },
      {
        "address":"1236 Floyd Walker Rd",
        "coords":{
          "lng":-84.135755,
          "lat":35.6123
        }
      },
      {
        "address":"1182 Floyd Walker Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.137126,
          "lat":35.614399
        }
      },
      {
        "address":"1553 Trigonia Rd",
        "coords":{
          "lng":-84.153391,
          "lat":35.606742
        }
      },
      {
        "address":"803 Trigonia Rd",
        "coords":{
          "lng":-84.181215,
          "lat":35.605433
        }
      },
      {
        "address":"7439 Russell Hollow Rd",
        "coords":{
          "lng":-84.172303,
          "lat":35.609591
        }
      },
      {
        "address":"542 Lee Shirley Rd, Maryville, TN, United States",
        "coords":{
          "lng":-84.15741,
          "lat":35.620669
        }
      },
      {
        "address":"1001 Lee Shirley Rd",
        "coords":{
          "lng":-84.148097,
          "lat":35.61362
        }
      },
      {
        "address":"7218 Howard School Rd",
        "coords":{
          "lng":-84.149324,
          "lat":35.604749
        }
      },
      {
        "address":"7801 Ray Ln, Maryville, TN, United States",
        "coords":{
          "lng":-84.159118,
          "lat":35.601784
        }
      },
      {
        "address":"7506 Ray Ln, Maryville, TN, United States",
        "coords":{
          "lng":-84.150534,
          "lat":35.600308
        }
      },
      {
        "address":"7859 Tomotley Rd",
        "coords":{
          "lng":-84.160452,
          "lat":35.591967
        }
      }
    ]
  }
});

newBus.save(function(err, data){
  if (err) console.log(err);
  else console.log(data);
});

var newBus = new Bus({
  "bus_number":100,
  "pm":{
    "changes_at_school":[

    ],
      "serves":[
        "William Blount High School",
        "Union Grove Middle",
        "Friendsville Elementary"
      ],
      "route":[
      {
        "address":"210 East 4th Avenue, Friendsville, TN, United States",
        "coords":{
          "lng":-84.129665,
          "lat":35.761931
        }
      },
      {
        "address":"221 Academy Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.138193,
          "lat":35.753536
        }
      },
      {
        "address":"610 South Farnum Street, Friendsville, TN, United States",
        "coords":{
          "lng":-84.144963,
          "lat":35.752353
        }
      },
      {
        "address":"701 Lane Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.115868,
          "lat":35.750638
        }
      },
      {
        "address":"4572 Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.110345,
          "lat":35.766499
        }
      },
      {
        "address":"669 West Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.107419,
          "lat":35.754289
        }
      },
      {
        "address":"221 Academy Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.138193,
          "lat":35.753536
        }
      },
      {
        "address":"499 Academy Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.13541,
          "lat":35.750164
        }
      },
      {
        "address":"701 Lane Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.115868,
          "lat":35.750638
        }
      },
      {
        "address":"879 Finn Long Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.096402,
          "lat":35.766796
        }
      },
      {
        "address":"1099 Lane Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.096968,
          "lat":35.754835
        }
      },
      {
        "address":"879 Finn Long Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.096402,
          "lat":35.766796
        }
      },
      {
        "address":"4215 Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.091333,
          "lat":35.777519
        }
      },
      {
        "address":"669 West Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.107419,
          "lat":35.754289
        }
      },
      {
        "address":"582 East Main Avenue, Friendsville, TN, United States",
        "coords":{
          "lng":-84.123968,
          "lat":35.753135
        }
      },
      {
        "address":"701 Lane Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.115868,
          "lat":35.750638
        }
      },
      {
        "address":"4572 Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.110345,
          "lat":35.766499
        }
      },
      {
        "address":"4215 Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.091333,
          "lat":35.777519
        }
      },
      {
        "address":"221 Academy Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.138193,
          "lat":35.753536
        }
      },
      {
        "address":"602 south farnum street",
        "coords":{
          "lng":-84.145908,
          "lat":35.752039
        }
      },
      {
        "address":"117 Dunlap Hollow Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.148137,
          "lat":35.74938
        }
      },
      {
        "address":"400 North Farnum Street, Friendsville, TN, United States",
        "coords":{
          "lng":-84.131023,
          "lat":35.762548
        }
      },
      {
        "address":"199 South Farnum Street, Friendsville, TN, United States",
        "coords":{
          "lng":-84.134088,
          "lat":35.759461
        }
      },
      {
        "address":"3301 W Lamar Alexander Pkwy, Friendsville, TN, United States",
        "coords":{
          "lng":-84.123889,
          "lat":35.752262
        }
      },
      {
        "address":"221 Academy Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.141618,
          "lat":35.75178
        }
      },
      {
        "address":"499 Academy Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.135426,
          "lat":35.750172
        }
      }
    ]
  },
    "am":{
      "changes_at_school":[

      ],
      "serves":[
        "William Blount High School",
        "Union Grove Middle",
        "Friendsville Elementary"
      ],
      "route":[
      {
        "address":"4215 Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.091333,
          "lat":35.777519
        }
      },
      {
        "address":"962 Lane Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.101567,
          "lat":35.75524
        }
      },
      {
        "address":"879 Finn Long Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.096402,
          "lat":35.766796
        }
      },
      {
        "address":"4572 Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.110345,
          "lat":35.766499
        }
      },
      {
        "address":"669 West Vinegar Valley Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.107419,
          "lat":35.754289
        }
      },
      {
        "address":"499 Academy Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.13541,
          "lat":35.750164
        }
      },
      {
        "address":"610 South Farnum Street, Friendsville, TN, United States",
        "coords":{
          "lng":-84.144963,
          "lat":35.752353
        }
      },
      {
        "address":"221 Academy Drive",
        "coords":{
          "lng":-84.138193,
          "lat":35.753536
        }
      },
      {
        "address":"221 Academy Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.138193,
          "lat":35.753536
        }
      },
      {
        "address":"701 Lane Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.115868,
          "lat":35.750638
        }
      },
      {
        "address":"1099 Lane Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.096954,
          "lat":35.754846
        }
      },
      {
        "address":"210 E 4th Ave, Friendsville, TN, United States",
        "coords":{
          "lng":-84.129665,
          "lat":35.761931
        }
      }
    ]
  }
});

newBus.save(function(err, data){
  if (err) console.log(err);
  else console.log(data);
});

var newBus = new Bus({
  "bus_number":38,
  "pm":{
    "changes_at_school":[

    ],
    "serves":[
      "William Blount High School",
      "Union Grove Middle",
      "Friendsville Elementary"
    ],
    "route":[
      {
        "address":"607 N Union Grove Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.08883,
          "lat":35.757147
        }
      },
      {
        "address":"858 Alley Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.081019,
          "lat":35.76544
        }
      },
      {
        "address":"3014 Miser School Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.080816,
          "lat":35.773058
        }
      },
      {
        "address":"3160 Miser School Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.088824,
          "lat":35.776374
        }
      },
      {
        "address":"3845 Miser Station Rd, Louisville, TN, United States",
        "coords":{
          "lng":-84.072835,
          "lat":35.783014
        }
      },
      {
        "address":"3706 Miser Station Rd, Louisville, TN, United States",
        "coords":{
          "lng":-84.066951,
          "lat":35.787673
        }
      },
      {
        "address":"3851 Miser Station Rd, Louisville, TN, United States",
        "coords":{
          "lng":-84.073127,
          "lat":35.782785
        }
      },
      {
        "address":"1065 N Union Grove Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.076214,
          "lat":35.774679
        }
      },
      {
        "address":"3952 Freels Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.07311,
          "lat":35.775531
        }
      },
      {
        "address":"2540 Whisper Creek Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.067106,
          "lat":35.780034
        }
      },
      {
        "address":"3818 Freels Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.064987,
          "lat":35.775772
        }
      },
      {
        "address":"4209 Miser Station Rd, Louisville, TN, United States",
        "coords":{
          "lng":-84.091418,
          "lat":35.778858
        }
      },
      {
        "address":"367 Cedar Crest Ln, Friendsville, TN, United States",
        "coords":{
          "lng":-84.130663,
          "lat":35.773458
        }
      },
      {
        "address":"235 Cedar Crest Ln, Friendsville, TN, United States",
        "coords":{
          "lng":-84.138385,
          "lat":35.77291
        }
      },
      {
        "address":"109 Cedar Crest Ln, Friendsville, TN, United States",
        "coords":{
          "lng":-84.132819,
          "lat":35.768463
        }
      },
      {
        "address":"301 Miser Station Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.11576,
          "lat":35.780202
        }
      }
    ]
  },
  "am":{
    "changes_at_school":[

    ],
    "serves":[
      "William Blount High School",
      "Union Grove Middle",
      "Friendsville Elementary"
    ],
    "route":[
      {
        "address":"607 N Union Grove Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.08883,
          "lat":35.757147
        }
      },
      {
        "address":"858 Alley Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.081019,
          "lat":35.76544
        }
      },
      {
        "address":"3014 Miser School Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.080816,
          "lat":35.773058
        }
      },
      {
        "address":"3160 Miser School Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.088824,
          "lat":35.776374
        }
      },
      {
        "address":"3845 Miser Station Rd, Louisville, TN, United States",
        "coords":{
          "lng":-84.072835,
          "lat":35.783014
        }
      },
      {
        "address":"3706 Miser Station Rd, Louisville, TN, United States",
        "coords":{
          "lng":-84.066951,
          "lat":35.787673
        }
      },
      {
        "address":"3851 Miser Station Rd, Louisville, TN, United States",
        "coords":{
          "lng":-84.073127,
          "lat":35.782785
        }
      },
      {
        "address":"1065 N Union Grove Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.076214,
          "lat":35.774679
        }
      },
      {
        "address":"3952 Freels Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.07311,
          "lat":35.775531
        }
      },
      {
        "address":"2540 Whisper Creek Drive, Friendsville, TN, United States",
        "coords":{
          "lng":-84.067106,
          "lat":35.780034
        }
      },
      {
        "address":"3818 Freels Rd, Friendsville, TN, United States",
        "coords":{
          "lng":-84.064987,
          "lat":35.775772
        }
      },
      {
        "address":"4209 Miser Station Rd, Louisville, TN, United States",
        "coords":{
          "lng":-84.091418,
          "lat":35.778858
        }
      },
      {
        "address":"367 Cedar Crest Ln, Friendsville, TN, United States",
        "coords":{
          "lng":-84.130663,
          "lat":35.773458
        }
      },
      {
        "address":"235 Cedar Crest Ln, Friendsville, TN, United States",
        "coords":{
          "lng":-84.138385,
          "lat":35.77291
        }
      },
      {
        "address":"109 Cedar Crest Ln, Friendsville, TN, United States",
        "coords":{
          "lng":-84.132819,
          "lat":35.768463
        }
      },
      {
        "address":"301 Miser Station Road, Friendsville, TN, United States",
        "coords":{
          "lng":-84.11576,
          "lat":35.780202
        }
      }
    ]
  }
});

newBus.save(function(err, data){
  if (err) console.log(err);
  else console.log(data);
});