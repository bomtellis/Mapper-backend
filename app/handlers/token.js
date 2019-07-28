'use strict'

var token = {};
var uuid = require('uuid/v4');
var Token = require('../models/tabletToken');
var User = require('../models/user');

function createToken()
{
    return new Promise(function(resolve, reject) {
        let uid = uuid();

        Token.create({
            token: uid
        }, function(err, output)
        {
            if(err)
            {
                reject(err);
            }
            else {
                resolve(output);
            }
        });
    });
}

// Create token, link tokenid to user account.
module.exports.generate = function(accountName) {
    return new Promise(function(resolve, reject) {
        // rate limiting for client
        try
        {
            User.findOne({username: accountName})
            .populate('tokenId')
            .exec(function(err, person)
            {
                if(err)
                {
                    throw err;
                }
                else
                {
                    if(typeof person.tokenId !== 'undefined' && person.tokenId !== null)
                    {
                        let now = Date.now();
                        let lastTime = person.tokenId.created;
                        let millis = now - lastTime;
                        let minutes = Math.floor((millis / 1000) / 60);

                        if(minutes < 0)
                        {
                            // rate limit too soon
                            reject();
                        }
                        else {
                            // remove old token
                            Token.deleteOne({token: person.tokenId.token}, function(err, removed)
                            {
                                if(err)
                                {
                                    throw err;
                                }
                                else
                                {
                                    // continue removed old token
                                    createToken().then(function(output)
                                    {
                                        User.findOneAndUpdate({username: accountName}, {$set: { "tokenId": output._id } }, (err, person) => {
                                            if(err)
                                            {
                                                console.log(err);
                                                reject(true, err);
                                            }
                                            else
                                            {
                                                resolve(output.token);
                                            }
                                        });
                                    }, function()
                                    {
                                        console.log("Error at 82");
                                    });
                                }
                            })
                        }
                    }
                    else
                    {
                        createToken().then(function(output)
                        {
                            User.findOneAndUpdate({username: accountName}, {$set: { "tokenId": output._id } }, (err, person) => {
                                if(err)
                                {
                                    console.log(err);
                                    reject(true, err);
                                }
                                else
                                {
                                    resolve(output.token);
                                }
                            });
                        }, function()
                        {
                            console.log("Error at 105");
                        });
                    }


                }
            })
        }

        catch (e)
        {
            reject(e);
        }
    });

}

// Create token, link tokenid to user account.
token.regenerate = function(inputToken) {
    return new Promise(function(resolve, reject) {
        try
        {
            Token.findOne({"token": inputToken}, function(err, output)
            {
                if(err)
                {
                    resolve(true);
                }
                else
                {
                    if(output.token == inputToken)
                    {
                        createToken(username).then(function(err, returned)
                        {
                            resolve(err, returned);
                        });
                    }
                    else
                    {
                        resolve(true);
                    }
                }
            });
        }
        catch (e)
        {
            reject(e);
        }
    });
}

module.exports.findOne = function(apiKey)
{
    return new Promise(function(resolve, reject) {
        try {
            // lookup token and check it
            Token.findOne({token: apiKey}, function(err, result)
            {
                if(err)
                {
                    throw err;
                    reject(err);
                }
                else
                {
                    if(result)
                    {
                        if(result.token === apiKey)
                        {
                            resolve(true);
                        }
                        else
                        {
                            resolve(false);
                        }
                    }
                    else
                    {
                        resolve(false);
                    }
                }
            })
        }

        catch {

        }
    });

}

module.exports.remove = function(apiKey, password)
{
    return new Promise(function(resolve, reject) {
        // verify token exists
        Token.findOne({token: apiKey}, function(err, result)
        {
            console.log('202: ' + result);
            if(err)
            {
                // something has gone wrong
                reject();
            }
            else
            {
                if(result)
                {
                    // good token is in collection
                    User.findOne({tokenId: result._id}, function(err, user)
                    {
                        if(err)
                        {
                            reject();
                        }
                        else
                        {
                            console.log('221: ' + user);
                            if(user)
                            {
                                // good has user
                                var auth = User.authenticate();
                                auth(user.username, password, function(err, result)
                                {
                                    if(err)
                                    {
                                        // something gone wrong
                                        reject();
                                    }
                                    else
                                    {
                                        if(result !== false)
                                        {
                                            console.log('237: Authenticated');
                                            // good remove token
                                            Token.deleteOne({token: apiKey}, function(err, result)
                                            {
                                                if(err)
                                                {
                                                    console.log('243: Error');
                                                    reject();
                                                }
                                                if(result)
                                                {
                                                    console.log('251: Here');
                                                    delete user.tokenId;
                                                    user.save();
                                                    
                                                    resolve();
                                                }

                                            });
                                        }
                                        else
                                        {
                                            // bad password
                                            console.log('257: Here');
                                            reject();
                                        }
                                    }
                                });
                            }
                            else {
                                // bad no user token registered delete anyway (orphaned apiKey)
                                console.log('260');
                                Token.deleteOne({token: apiKey}, function(err)
                                {
                                    if(err)
                                    {
                                        reject();
                                    }
                                    else
                                    {
                                        resolve();
                                    }
                                })
                            }
                        }
                    });
                }
                else
                {
                    // bad no token has been found in collection
                    reject();
                }
            }
        })
    });
};
