var Bus = require("./bus");

var newBus = new Bus({
  bus_number: 3,
  serves: [
    "WBHS",
    "Carpenters Middle",
    "Lanier Elementary"
  ],
  route: {
    am: [
      [35.611035, -83.951239],
      [35.615656, -83.947353],
      [35.616806, -83.943056],
      [35.614700, -83.948033],
      [35.610416, -83.954578],
      [35.580460, -83.989006],
      [35.566529, -84.096829]
    ],
    pm: [
      []
    ]
  },
  changes_at_school: "none"
});

newBus.save(function(err, data){
  if (err) console.log(err);
  else console.log(data);
});

var newBus = new Bus({
  bus_number: 28,
  serves: [
    "Lanier Elementary",
    "Carpenters Middle",
    "WBHS"
  ],
  route: {
    am: [
      [35.645329, -84.068154],
      [35.642494, -84.10111],
      [35.645328, -84.104651],
      [35.637612, -84.114654],
      [35.636195, -84.09983],
      [35.623241, -84.097996]
    ],
    pm: [
      [] // Empty set because schema requires everything to have a value
    ]
  },
  changes_at_school: "Lanier Elementary"
});

newBus.save(function(err, data){
  if (err) console.log(err);
  else console.log(data);
});