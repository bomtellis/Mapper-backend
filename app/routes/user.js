var express = require('express');
var userRoutes = express.Router();
const User = require('../models/user');
const passport = require('passport');

userRoutes.get('/', function(req, res) {
    res.json({
        "message": "user Subroute works"
    });
});

// cookie validation (yes/no)
userRoutes.get('/session', function(req, res)
{
    if(typeof req.session !== 'undefined' && typeof req.session.passport !== 'undefined')
    {
        if(req.session.passport.length !== 0)
        {
            res.status(200);
            res.json({
                message: "Valid",
                cookie: req.session.passport
            });
        }
    }
    else
    {
        res.status(401);
        res.json({
            message: "Invalid"
        });
    }
});

// tablet token (yes/no)
userRoutes.get('/validate', function(req, res)
{

});

// Create account
userRoutes.post('/signup', (req, res, next) => {
    User.register(new User({
            username: req.body.username
        }),
        req.body.password, (err, user) => {
            if (err) {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    err: err
                });
            } else {
                passport.authenticate('local')(req, res, () => {
                    User.findByUsername({
                        username: req.body.username
                    }, (err, person) => {
                        res.status(200);
                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                            success: true,
                            status: 'Registration Successful!',
                        });
                    });
                })
            }
        })
});

// user login
userRoutes.post('/login', passport.authenticate('local'), function(req, res) {
    User.findOne({
        username: req.body.username
    }, (err, person) => {
        if (person.active)
            res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            permissionLevel: person.role,
            status: 'You are successfully logged in!'
        });
    })
});

// user logout
userRoutes.get('/logout', function(req, res, next) {
    if (req.session) {
        req.logout();
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            } else {
                res.clearCookie('mapperSession');
                res.json({
                    message: 'You are successfully logged out!'
                });
            }
        });
    } else {
        res.status(403);
        res.json({
            message: "You are not logged in"
        });
    }
});

// export the routes
module.exports = userRoutes;
