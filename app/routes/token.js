var express = require('express');
var tokenRoutes = express.Router();
var uuid = require('uuid/v4');
var Token = require('../handlers/token');

/* GET /api/token/
*  Generates a token for a logged in user
*/
tokenRoutes.get('/', isViewer, function(req, res)
{
    // grab the cookie data
    let cookieData = req.session.passport.user;

    Token.generate(username).then(function(err, key)
    {
        if(err)
        {
            throw err;
            res.status(500);
            res.json({
                message: "An error has occurred"
            });
        }
        else
        {
            // no error give the token back
            res.status(201);
            res.json({
                token: key.token,
                expires: key.expires
            });
        }
    });
});

/* POST /api/token {POSTDATA}
*  If the token is valid, app regenerates a new token to pass back
*/
tokenRoutes.post('/', function(req, res)
{
    let token = req.tokenData;

    Token.regenerate(token).then(function(err, key)
    {
        if(err)
        {
            throw err;
            res.status(500);
            res.json({
                message: "An error has occurred"
            });
        }
        else
        {
            // no error give the token back
            res.status(201);
            res.json({
                token: key.token,
                expires: key.expires
            });
        }
    });
});

// export the routes
module.exports = tokenRoutes;
