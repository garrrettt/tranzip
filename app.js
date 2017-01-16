var express = require('express');
var favicon = require('serve-favicon');

var app = express();

app.use(favicon(__dirname + '/public/img/favicon.ico'));
var logger = require('morgan'); // for debugging messages
var path = require('path'); // for combining file path names
var bodyParser = require('body-parser'); // for processing form submission

app.use(bodyParser.urlencoded({ extended: true })); // support URL-encoded bodies
app.use(bodyParser.json()); // support JSON-encoded bodies

app.set('view engine', 'ejs');
app.use(logger('dev'));

// Connect to Mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://0.0.0.0/buses');
var db = mongoose.connection;

// configure passport
var expressSession = require('express-session');
var passport = require('passport');
var initPassport = require('./passport/init');
initPassport(passport);

app.use(expressSession({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// use flash messages to tell user if they logged in successfully or not
var flash = require('connect-flash');
app.use(flash());

// routes
var routes = require('./routes/index');
var formSubmit = require('./routes/formSubmit');
var admin = require('./routes/admin')(passport); // pass in passport for authentication

// currently out-of-date
var apiRoutes = require('./routes/apiRoutes');

app.use('/', routes);
app.use('/submit', formSubmit);
app.use('/admin', admin);
app.use('/api', apiRoutes); // API Routes is for other people to use our data (routes, buses, etc.)

// Seed the database with 3 buses and 1 school system
// Uncomment and run `node app` to seed.  Then re-comment
// var seeds = require('./models/seeds');

// serve up static files using folder names within public
app.use(express.static('public'));
app.set('/views', path.join(__dirname, 'views'));

// 404
app.use('*', function(req, res) {
  res.status(404).render('404');
});

app.listen(8080, '0.0.0.0', function() {
  console.log('Running on port 8080...');
});