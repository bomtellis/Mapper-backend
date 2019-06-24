var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var generatorSchema = new Schema({
    generatorNumber: {
        type: Number
    },
    ratings: {
        powerOutput: {
            type: Number
        },
    },
    outputs: [{
        type: String
    }],
    notes: [{
        type: Schmea.Types.ObjectId,
        ref: 'GeneratorNote'
    }],
    status: {
        isOperational: {
            type: Boolean,
            default: false
        },
        hasFault: {
            type: Boolean,
            default: false
        }
    }
});

/* Notes:
* outputs is a list of substations that this generator can power
* ratings is a list of the specifications for the generator
* ratings.powerOutput is in kW
*
*/
module.exports = mongoose.model('generator', generatorSchema);
