var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var generatorNoteSchema = new Schema({
    message: {
        type: String
    },
    initals: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('generatorNote', generatorNoteSchema);
