var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boilerTestSchema = new Schema({
    boilerName: {
        type: Text
    },
    tds: {
        type: Number
    },
    o2: {
        type: Number
    },
    fluetemp: {
        type: Number
    },
    safety: {
        first: {
            type: Boolean
        },
        second: {
            type: Boolean
        }
    },
    complete: {
        type: Boolean
    },
    failed: {
        type: Boolean,
        default: false
    },
    signature: {
        type: 
    }
});

module.exports = mongoose.model('boilerTest', boilerTestSchema);
