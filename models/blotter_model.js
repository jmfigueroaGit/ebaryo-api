const mongoose = require('mongoose');

const blotterModel = new mongoose.Schema(
    {
        caseType: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        complainant: {
            type: String,
            required: true
        },
        defendant: {
            type: String,
            required: true
        },
        bltrId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            default: "pending",
            enum: ["pending", "on going", "closed"]
        }
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.Blotter ||
    mongoose.model('Blotter', blotterModel);
