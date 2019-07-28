var express = require('express');
var apiRoutes = express.Router();

// imported child routes
var userRoutes = require('./user');
var tokenRoutes = require('./token');
var mapRoutes = require('./maps');
var pdfRoutes = require('./pdf');
var websocketRoutes = require('./websocket');
var genTestRoutes = require('./genTest');
var boilerRoutes = require('./boiler');

/*
    add to /api/
    root / api ( here ) / child ( imported route ) / grandchild ( sub routes )
    /api/{x}/{y}
*/

apiRoutes.use('/users/', userRoutes);
apiRoutes.use('/token/', tokenRoutes);
apiRoutes.use('/maps/', mapRoutes);
apiRoutes.use('/pdf/', pdfRoutes);
apiRoutes.use('/websocket', websocketRoutes);
apiRoutes.use('/genTest', genTestRoutes);
apiRoutes.use('/boilers', boilerRoutes);


apiRoutes.get('/', function(req, res)
{
    res.json({"message": "Mapper API"});
});

apiRoutes.get('/setup', function(req, res)
{
    res.json({
        "message": "Your configuration is correct",
        "config": req.config
    });
});

// export the routes
module.exports = apiRoutes;
