var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var genTestSchema = new Schema({
    testName: {
        type: String
    },
    zoneNumber: {
        type: Number
    },
    subName: {
        type: String
    },
    generatorNumber: {
        type: Number
    },
    cycleFrequency: {
        type: Number
    },
    startWeek: {
        type: Number
    },
    startDay: {
        type: Number
    }
});

// cycleFrequency is time between runs
// start week is ppm week start relative to other gen tests

module.exports = mongoose.model('genTest', genTestSchema);
