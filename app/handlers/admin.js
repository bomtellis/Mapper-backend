'use strict';

const User = require('../models/user');
const Token = require('../models/tabletToken');
const Map = require('../models/map');

module.exports.stats = function() {
    return new Promise(async function(resolve, reject) {
        let users = await User.estimatedDocumentCount();
        let tokens = await Token.estimatedDocumentCount();
        let maps = await Map.estimatedDocumentCount();

        resolve({
            users: users,
            tokens: tokens,
            maps: maps
        });
    });
};

module.exports.users = function() {
    return new Promise(async function(resolve, reject) {
        User.find({}, 'username firstName lastName active role last', function(err, users) {
            if (err) {
                reject(err);
            } else {
                if (users) {
                    resolve(users);
                }
            }
        });
    });
}

async function censorKeys(output) {
    for (let i = 0; i < output.length; i++) {
        if (output[i].tokenId !== null) {
            let keyParts = output[i].tokenId.token.split('-');
            output[i].tokenId.token = keyParts[4];
        }
    }

    return output;
}

module.exports.keys = function() {
    return new Promise(async function(resolve, reject) {
        User.find({}, 'username tokenId').populate('tokenId').exec(async function(err, output) {
            if (err) {
                console.log('63');
                reject(err);
            }

            var censored = await censorKeys(output);

            resolve(censored);
        });

    });
}

module.exports.createUser = function(formModel) {
    return new Promise(function(resolve, reject) {
        let userModel = formModel;
        let password = formModel.password;
        delete userModel.password;

        User.register(userModel, password, function(err, user) {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve();
            }
        });
    });
}
