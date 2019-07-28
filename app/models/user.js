var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var Token = require('./tabletToken');

var UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    role: {
        type: Number,
        default: 0
    },
    tokenId: {
        type: String,
        ref: 'TabletToken',
        default: null
    }
});

UserSchema.plugin(passportLocalMongoose, {
    limitAttempts: true,
    lastLogin: 'last',
    findByUsername: function(model, queryParams)
    {
        queryParams.active = true;
        return model.findOne(queryParams);
    }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
