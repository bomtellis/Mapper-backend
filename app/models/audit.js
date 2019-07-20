var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Imports
var map = require('./map');
var user = require('./user');

var auditSchema = new Schema({
    mapId: {
        type: Schema.Types.ObjectId,
        ref: 'map'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    accessTime: {
        type: Date,
        default: Date.now
    }
});

// Validators
module.exports = mongoose.model('audit', auditSchema);
