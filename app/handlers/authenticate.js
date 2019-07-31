// Authenticate middleware
var Passport = require('passport');
var User = require('../models/user');
var Token = require('../models/tabletToken');

module.exports.isAdmin = function(req, res, next)
{
    if(typeof req.session === 'undefined')
    {
        console.log('10');
        res.status(409);
        res.json({
            message: "Your session has expired"
        })
    }
    else
    {
        if(typeof req.session.passport === 'undefined')
        {
            console.log(req.session);
            console.log('20');
            res.status(409);
            res.json({
                message: "Passport has not got values for your account"
            });
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
    }
};

module.exports.isEditor = function(req, res, next)
{
    if(typeof req.session === 'undefined')
    {
        res.status(409);
        res.json({
            message: "Your session has expired"
        })
    }
    else
    {
        if(typeof req.session.passport === 'undefined')
        {
            res.status(409);
            res.json({
                message: "Passport has not got values for your account"
            });
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
                        message: "You are unauthorised to do this. You must have at least level 1 clearance"
                    })
                }
            });
        }
    }
};

module.exports.hasSession = function(req, res, next)
{
    if(typeof req.session === 'undefined')
    {
        res.status(409);
        res.json({
            message: "Your session has expired"
        })
    }
    else
    {
        if(typeof req.session.passport === 'undefined')
        {
            res.status(409);
            res.json({
                message: "Passport has not got values for your account"
            });
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
    }
};

module.exports.isViewer = function(req, res, next)
{
    // check for a token
    if(typeof req.headers.tablettoken !== 'undefined')
    {
        // look up token
        Token.findOne({token: req.headers.tablettoken}, function(err, tokenData)
        {
            if(err)
            {
                // no token or invalid
                res.status(401);
                res.json({
                    message: "Invalid token"
                })
            }
            else
            {
                if(typeof tokenData !== 'undefined' && tokenData !== null)
                {
                    next();
                }
                else
                {
                    res.status(401);
                    res.json({
                        message: "Invalid token"
                    })
                }
            }
        })
    }
    else
    {
        // normal login
        if(typeof req.session === 'undefined')
        {
            res.status(401);
            res.json({
                message: "Your session has expired"
            })
        }
        else
        {
            if(typeof req.session.passport === 'undefined')
            {
                res.status(409);
                res.json({
                    message: "Passport has not got values for your account"
                });
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
        }
    }
};
