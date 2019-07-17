// index.js

// imports
const { MONGOIP, MONGODB, MONGOUSER, MONGOPASS, MONGOPORT, MONGOAUTH, PORT, SSL_ENABLE, SSL_PRIV_KEY, SSL_PUB_KEY } = require('./config');
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var https = require('https');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require("morgan");

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
if(SSL_ENABLE == 'true') {
    server.listen(PORT);
} else {
    app.listen(PORT);
}


// log start up
console.log('Magic happens on port ' + PORT);
