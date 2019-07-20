var mongoose = require('mongoose');
var S = mongoose.Schema;

var expiryDate = Date.now
expiryDate.setHours(expiryDate.getHours() + 24);
console.log(expiryDate);

var TabletTokenSchema = new S({
    token: {
        type: String
    },
    expires: {
        type: Date,
        default: expiryDate
    }
});

module.exports = mongoose.model('TabletToken', TabletTokenSchema);
