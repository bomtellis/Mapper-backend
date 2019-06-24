var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mapSchema = new Schema({
    mapName: {
        type: String
    },
    description: {
        type: String
    },
    uriPath: {
        type: String
    },
    hidden: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Validators


module.exports = mongoose.model('map', mapSchema);
