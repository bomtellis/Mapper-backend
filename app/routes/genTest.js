var express = require('express');
var route = express.Router();

// import model
var GenTest = require('../models/genTest');

route.get('/', function(req, res)
{
    res.json({"message": "Gen Test works"});
});

route.get('/populate', function(req, res)
{
    GenTest.create({
        testName: "On load",
        zoneNumber: 3,
        subName: "3",
        generatorNumber: "3",
        cycleFrequency: 4,
        startWeek: 1,
        startDay: 2
    }, function(err, test)
    {
        if(err)
        {
            throw err;
        }
        else
        {
            res.json(test);
        }
    });
});

// get all
route.get('/all', function(req, res)
{
    GenTest.find({})
    .exec(function(err, tests)
    {
        if(err)
        {
            throw err;
            res.status(500);
            res.json(err);
        }
        else
        {
            res.json(tests);
        }
    })
});

// create
route.post('/', function(req, res)
{

});



// get one
route.get('/view/:id', function(req, res)
{

});

// today's test
route.get('/view/:id', function(req, res)
{

});

// export the routes
module.exports = route;
