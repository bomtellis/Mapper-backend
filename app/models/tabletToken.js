var mongoose = require('mongoose');
var S = mongoose.Schema;

var TabletTokenSchema = new S({
    token: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TabletToken', TabletTokenSchema);
