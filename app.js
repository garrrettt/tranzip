var express = require('express');
var app = express();

var logger = require('morgan'); // for debugging messages
var path = require('path'); // for combining file path names
var bodyParser = require('body-parser'); // for processing form submission

app.use(bodyParser.urlencoded({ extended: true })); // support URL-encoded bodies
app.use(bodyParser.json()); // support JSON-encoded bodies

app.set('view engine', 'ejs');
app.use(logger('dev'));

// Connect to Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/buses');
var db = mongoose.connection;

// routes
var routes = require('./routes/index');
var apiRoutes = require('./routes/apiRoutes');

app.use('/', routes); // Main app back-end logic
app.use('/api', apiRoutes); // API Routes is for other people to use our data (routes, buses, etc.)

// Seed the database with 2 buses
// Uncomment and run `node app` to seed.  Then re-comment
// var Bus = require('./models/seeds');

// serve up static files using folder names within public
app.use(express.static('public'));
app.set('/views', path.join(__dirname, 'views'));

app.listen(8080, '0.0.0.0', function() {
  console.log('Running on port 8080...');
});