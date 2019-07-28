var express = require('express');
var tokenRoutes = express.Router();
var uuid = require('uuid/v4');
var Token = require('../handlers/token');
const { isAdmin, isEditor, isViewer, hasSession } = require('../handlers/authenticate');

/* GET /api/token/
*  Generates a token for a logged in user
*/
tokenRoutes.get('/', hasSession, function(req, res)
{
    // grab the cookie data
    if(typeof req.session !== 'undefined' && typeof req.session.passport !== 'undefined')
    {
        var cookieData = req.session.passport.user;
        Token.generate(cookieData).then(function(key)
        {
            // no error give the token back
            res.status(201);
            res.json(key);
        }, function()
        {
            res.status(500);
            res.json({
                message: "An error occured"
            })
        });
    }
    else
    {
        res.status(401);
        res.json({
            message: "Invalid"
        });
    }
});

/* POST /api/token {POSTDATA}
*  If the token is valid, app regenerates a new token to pass back
*/
// tokenRoutes.post('/', function(req, res)
// {
//     let token = req.tokenData;
//
//     Token.regenerate(token).then(function(err, key)
//     {
//         if(err)
//         {
//             throw err;
//             res.status(500);
//             res.json({
//                 message: "An error has occurred"
//             });
//         }
//         else
//         {
//             // no error give the token back
//             res.status(201);
//             res.json({
//                 token: key.token,
//                 expires: key.expires
//             });
//         }
//     });
// });

tokenRoutes.get('/verify', function(req, res)
{
    if(typeof req.headers.tablettoken !== 'undefined')
    {
        var token = req.headers.tablettoken;

        // lookup token and check it
        Token.findOne(token).then(function(outcome)
        {
            if(outcome)
            {
                // good treu
                res.status(200);
                res.json({
                    message: "Valid"
                })
            }
            else
            {
                // bad false
                res.status(404);
                res.json({
                    message: "Token Invalid"
                })
            }
        }, function(outcome)
        {
            res.status(500);
            res.json({
                message: "Server error"
            })
        });
    }
    else
    {
        res.status(400);
        res.json({
            message: "Server error"
        })
    }
});

tokenRoutes.post('/remove', function(req, res)
{
    if(typeof req.headers.tablettoken !== 'undefined')
    {
        if(typeof req.body.password !== 'undefined')
        {
            var token = req.headers.tablettoken;

            Token.remove(req.headers.tablettoken, req.body.password).then(function()
            {
                // good has removed token
                res.status(200);
                res.json({
                    message: "Token removed"
                });
            },
            function()
            {
                // bad login or no token exists
                res.status(404);
                res.json({
                    message: "Bad password or token doesn\'t exist"
                });
            })
        }
        else
        {
            res.status(400);
            res.json({
                message: "Invalid Password"
            });
        }
    }
});

// export the routes
module.exports = tokenRoutes;
