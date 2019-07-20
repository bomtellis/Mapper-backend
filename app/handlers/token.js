'use strict'

var uuid = require('uuid/v4');
var tabletToken = require('../models/tabletToken');
var User = require('../models/user');

function createToken(username, callback)
{
    let uid = uuid();

    tabletToken.create({
        token: uid
    }, function(err, output)
    {
        if(err)
        {
            throw err;
            cb(err);
        }
        else
        {
            // find user
            User.findByUsername(username).then(function(err, user)
            {
                user.tokenId = output.tokenId;
                await user.save();

                cb(null, output);
            });
        }
    });
}

// Create token, link tokenid to user account.
token.generate = async function(username, cb) {
    try {
        await createToken(username, function(err, output)
        {
            cb(err, output);
        });
    } catch (e) {
        cb(e);
    }
}

// Create token, link tokenid to user account.
token.regenerate = async function(inputToken, cb) {
    try
    {
        // find the token in db
        await tokenValid = tabletToken.findOne({"token": inputToken});

        if(tokenValid.token == inputToken)
        {
            // good token continue - find the user by tokenId
            await user = User.findOne({"tokenId": inputToken});

            if(user.tokenId == inputToken)
            {
                // gen new token
                createToken(username, function(err, output)
                {
                    cb(err, output);
                });
            }
            else
            {
                cb(true);
            }
        }
        else
        {
            cb(true);
        }
    }
    catch (e)
    {
        cb(e);
    }
}

module.exports = token;
