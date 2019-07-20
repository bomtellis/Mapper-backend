// index.js

// imports
const { MONGOIP, MONGODB, MONGOUSER, MONGOPASS, MONGOPORT, MONGOAUTH, PORT, SESSION_SECRET } = require('./config');
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var https = require('https');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require("morgan");

// Authentication
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./app/models/user');

// Express session middlewares
app.use(cookieParser());
app.use(session({
    name: 'mapperSession',
    secret: SESSION_SECRET,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 86400000,
    },
    saveUninitialized: false,
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var server = https.createServer({
    key: fs.readFileSync('./certs/privkey.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
}, app);
var expressWs = require('express-ws')(app, server);

// configure body parser
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp'
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://' + MONGOUSER + ':' + MONGOPASS + '@' + MONGOIP + ':' + MONGOPORT + '/' + MONGODB + '?auth=' + MONGOAUTH, {useNewUrlParser: true});
app.use(morgan("dev"));

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Request-Headers", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,X-HTTP-Method-Override, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Routes
var apiRoutes = require('./app/routes/apis');

// router's routes /api/{x}
app.use('/api', apiRoutes);
app.use('/maps', express.static('maps'));

// start app
// app.listen(port);
server.listen(PORT);

// log start up
console.log('Magic happens on port ' + PORT);
