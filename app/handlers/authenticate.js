// Authenticate middleware
var Passport = require('passport');
var User = require('../models/user');

// User can edit other accounts create new accounts disable accounts etc.
//admin

// User can create and edit maps
//editor

// User can view maps
//viewer

module.exports.isAdmin = function(req, res, next)
{
    if(typeof(req.session.passport) == 'undefined')
    {
        res.status(409);
        res.json({
            message: "Your session has expired"
        })
    }
    else
    {

        let passportUsername = req.session.passport.user
        User.findByUsername(passportUsername, function(err, person)
        {
            if(err)
            {
                res.status(409);
                res.json({
                    message: "Your session has expired"
                })
            }

            if(person.role >= 3){
                next();
            }
            else
            {
                res.status(401);
                res.json({
                    message: "You are unauthorised to do this. You must have at least level 3 clearance"
                })
            }
        });
    }
};

module.exports.isEditor = function(req, res, next)
{
    if(typeof(req.session.passport) == 'undefined')
    {
        res.status(409);
        res.json({
            message: "Your session has expired"
        })
    }
    else
    {

        let passportUsername = req.session.passport.user
        User.findByUsername(passportUsername, function(err, person)
        {
            if(err)
            {
                res.status(409);
                res.json({
                    message: "Your session has expired"
                })
            }

            if(person.role >= 2){
                next();
            }
            else
            {
                res.status(401);
                res.json({
                    message: "You are unauthorised to do this. You must have at least level 2 clearance"
                })
            }
        });
    }
};

module.exports.isViewer = function(req, res, next)
{
    if(typeof(req.session.passport) == 'undefined')
    {
        res.status(409);
        res.json({
            message: "Your session has expired"
        })
    }
    else
    {

        let passportUsername = req.session.passport.user
        User.findByUsername(passportUsername, function(err, person)
        {
            if(err)
            {
                res.status(409);
                res.json({
                    message: "Your session has expired"
                })
            }

            if(person.role >= 1){
                next();
            }
            else
            {
                res.status(401);
                res.json({
                    message: "You are unauthorised to do this. You must have at least level 1 clearance"
                })
            }
        });
    }
};
