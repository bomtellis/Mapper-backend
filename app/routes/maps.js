var express = require('express');
var mapRoutes = express.Router();

// import models
var map = require('../models/map');

// import handler
var pdfHandler = require('../handlers/convertPdf');
var remover = require('../handlers/removeMap');
var q = require('../handlers/defer');

/*
 * Test functions for Postman
*/

mapRoutes.get('/', function(req, res)
{
    res.json({"message": "Map sub route works!"});
});
mapRoutes.get('/populate', function(req, res)
{
    // create new map element only once
    map.find({}, function(err, maps)
    {
        if(err)
        {
            throw err;
            res.status(500);
            res.json(err);
        }
        else
        {
            if(maps.length == 0)
            {
                // no maps - populate
                var schema = {
                    mapName: "Ground Floor",
                    description: "Plant room and Switchrooms on ground floor",
                    uriPath: "//"
                }

                map.create(schema, function(err, mapx)
                {
                    if(err)
                    {
                        throw err;
                        res.status(500);
                        res.json(err);
                    }
                    else
                    {
                        res.status(201);
                        res.json({"message": "Database populated"});
                    }
                });
            }
            else
            {
                // maps exist
                res.status(409);
                res.json({"message": "Database already populated"});
            }
        }
    })
});
mapRoutes.get('/depopulate', function(req, res)
{
    map.deleteMany({}, function(err, response)
    {
        if(err)
        {
            throw err;
            res.status(500);
            res.json({"message": "Failed to remove all documents"});
        }
        else
        {
            res.status(410);
            res.json({"message": "Removed all documents"});
        }
    });
});

/*
 * End Test functions for Postman
*/

// Web socket that opens after upload
mapRoutes.ws('/', function(ws, req)
{
    ws.on('message', function(msg)
    {
        try {
            var message = JSON.parse(msg);
        } catch (e) {
            console.log('JSON didnt parse');
        }

        ws.send(JSON.stringify({action: "ready"}));

        if(message.action == "add.refresh")
        {
            // add wants to know when to refresh
            console.log('Refresh promise created');
            var resolve = q().then(function()
            {
                console.log('Resolved the promise');
                let jMessage = {
                    action: "refresh"
                }
                ws.send(JSON.stringify(jMessage));
            });
        }
    });

    ws.on('close', req => {
        console.log('Socket closed')
    });
});

// Create a new map
mapRoutes.post('/', function(req, res){
    if(typeof req.files !== 'undefined' && req.files !== null)
    {
        if (req.files.uploadedFile.mimetype !== "application/pdf") {
            res.json({
                "message": "Invalid file type"
            });
        } else {
            // User response
            if(req.body.length !== 0)
            {
                res.status(201);
                res.json({
                    "message": "Ack"
                });

                if(!!req.body.update === true)
                {
                    pdfHandler.update(req.files.uploadedFile, req.body).then(function()
                    {
                        q.resolve();
                    });
                }
                else
                {
                    pdfHandler.convert(req.files.uploadedFile, req.body).then(function()
                    {
                        q.resolve();
                    });
                }
            }
        }
    }
    else
    {
        // no file found just update the map details
        let formData = req.body;
        // no file
        map.findByIdAndUpdate(formData.mapId, {
            $set: {
                mapName: formData.mapName,
                description: formData.description,
                hidden: formData.hidden,
                lastUpdated: Date.now()
            }
        }, function(err, doc)
        {
            if(err)
            {
                throw err;
            }
            else
            {
                res.status(200);
                res.json(doc);
            }
        });
    }
});

mapRoutes.get('/hide/:id', function(req, res)
{
    let id = req.params.id;
    map.findByIdAndUpdate(id, {$set: {hidden: true}}, function(err, doc)
    {
        if(err)
        {
            throw err;
            res.status(500);
            res.json(err);
        }
        else
        {
            res.status(200);
            res.json({"message": "Map hidden"});
        }
    })
})

// Delete map
mapRoutes.delete('/:id', function(req, res)
{
    let id = req.params.id;
    remover(id).then(function()
    {
        res.status(200);
        res.json({"message": "Removed"});
    });
});

// Get all maps
mapRoutes.get('/all', function(req, res)
{
    map.find({}).select('-uriPath')
    .exec(function(err, maps)
    {
        if(err)
        {
            throw err;
            res.status(500);
            res.json(err);
        }
        else
        {
            res.json(maps);
        }
    })
});

// Get all maps visible
mapRoutes.get('/visible', function(req, res)
{
    map.find({hidden: false}).select('-uriPath')
    .exec(function(err, maps)
    {
        if(err)
        {
            throw err;
            res.status(500);
            res.json(err);
        }
        else
        {
            res.status(200);
            res.json(maps);
        }
    })
});

// Get a map
mapRoutes.get('/:id', function(req, res)
{
    try {
        // check if id matches objectid
        if(req.params.id.match(/^[0-9a-fA-F]{24}$/))
        {
            // castable
            map.findById(req.params.id, function(err, aMap)
            {
                if(err)
                {
                    throw err;
                    res.status(500);
                    res.json(err);
                }
                else
                {
                    res.json(aMap);
                }
            })
        }
    }
    catch (e)
    {

    }
});

module.exports = mapRoutes;
