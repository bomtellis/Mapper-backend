// index.js

// imports
const { MONGOIP, MONGODB, MONGOUSER, MONGOPASS, MONGOPORT, MONGOAUTH, PORT, SESSION_SECRET, SSL_ENABLE, SSL_PRIV_KEY, SSL_PUB_KEY } = require('./config');
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
        secure: SSL_ENABLE,
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

// If SSL_ENABLE = true run app on HTTPS
if(SSL_ENABLE == 'true')
{
    console.log('SSL Enabled');
    var server = https.createServer({
        key: fs.readFileSync(SSL_PRIV_KEY),
        cert: fs.readFileSync(SSL_PUB_KEY)
    }, app);

    var expressWs = require('express-ws')(app, server);
}
else
{
    var expressWs = require('express-ws')(app);
}

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
    // HACK: CORS on chrome / client
    var origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Request-Headers", "*");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,X-HTTP-Method-Override, Content-Type, Accept, tabletToken, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// Routes
var apiRoutes = require('./app/routes/apis');

// router's routes /api/{x}
app.use('/api', apiRoutes);
app.use('/maps', express.static('maps'));

// start app
if(SSL_ENABLE == 'true') {
    server.listen(PORT);
} else {
    app.listen(PORT);
}


// log start up
console.log('Magic happens on port ' + PORT);
