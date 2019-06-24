var express = require('express');
var boilerRoutes = express.Router();

boilerRoutes.get('/', function(req, res)
{
    res.json({"message": "Boiler Subroute works"});
});

// Create Test
boilerRoutes.post('/', function(req, res)
{
    console.log(req.body);
    res.status(201);
    res.json({"message": "True"});
});

// Get all tests
boilerRoutes.get('/', function(req, res)
{

});

// Get data for graphs
boilerRoutes.get('/graphs', function(req, res)
{

});

// Get individual test
boilerRoutes.get('/:id', function(req, res)
{

});



// export the routes
module.exports = boilerRoutes;
