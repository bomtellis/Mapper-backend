var express = require('express');
var websocketRoutes = express.Router();

// WS api/websocket/

websocketRoutes.ws('/', function(ws, req)
{
    ws.send("Hello");

    ws.on('message', function(msg)
    {
        console.log(msg);
    });
});

// GET /api/websocket/

websocketRoutes.get('/', function(req, res)
{
    setTimeout(function()
    {
        res.json({"message": "done"});
    }, 9000);
});

module.exports = websocketRoutes;
