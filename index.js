// index.js

// clustering
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// imports
const { MONGOIP, MONGODB, MONGOUSER, MONGOPASS, MONGOPORT, MONGOAUTH,
     PORT, SESSION_SECRET, SSL_ENABLE, SSL_PRIV_KEY, SSL_PUB_KEY,
 COOKIE_SECURE, COOKIE_HTTP_ONLY, NODE_ENV, REDIS_HOST, REDIS_PORT,} = require('./config');
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
var redis = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var client = redis.createClient(REDIS_PORT, REDIS_HOST);
var LocalStrategy = require('passport-local').Strategy;
var User = require('./app/models/user');


if(cluster.isMaster)
{
    console.log(`Master ${process.pid} is running`);

    for(let i = 0; i < numCPUs; i++)
    {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });

    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} started up`);
    });
}

else
{
    // application code
    // Express session middlewares
    app.use(cookieParser());
    app.use(session({
        name: 'mapperSession',
        secret: SESSION_SECRET,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 86400000,
        },
        store: new redisStore(
        {
            host: REDIS_HOST,
            port: REDIS_PORT,
            client: client
        }),
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
    mongoose.connect('mongodb://' + MONGOUSER + ':' + MONGOPASS + '@' + MONGOIP + ':' + MONGOPORT + '/' + MONGODB + '?auth=' + MONGOAUTH, {useNewUrlParser: true, useUnifiedTopology: true});
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

    // setup route (interactive)
    app.use('/setup', (req, res, next) => {
        if(NODE_ENV == 'development')
        {
            next();
        }
        else
        {
            res.status(500);
            res.sendFile(__dirname + '/app/setup/error.html');
        }
    }, express.static('app/setup'));

    // start app
    if(SSL_ENABLE == 'true') {
        server.listen(PORT);
    } else {
        app.listen(PORT);
    }
}
