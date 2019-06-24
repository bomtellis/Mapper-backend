var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boilerSchema = new Schema({
    boilerName: {
        type: Text
    },
    status: {
        type: Boolean
    },
    specs: {
        pressure: {
            type: Number
        }
    }
});

// specs
// pressure in bar g

module.exports = mongoose.model('boiler', boilerSchema);
