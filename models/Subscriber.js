const mongoose = require("mongoose");

const SubscriberSchema = mongoose.Schema({

    email: {
        type: String,
        required: true,
        unigue: true,
        trim: true,
        lowercase: true,
    },
    subscribeAt: {
        type: Date,
        default: Date.now,
    }

})

module.exports = mongoose.model("Subscriber", SubscriberSchema);