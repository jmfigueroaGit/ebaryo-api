const mongoose = require('mongoose');

const feedbackModel = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        description: {
            type: String,
            required: true
        },
        fdbkId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: 'unread',
            enum: ['unread', 'prioritized', 'viewed', 'actioned', 'archived']
        }
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.Feedback ||
    mongoose.model('Feedback', feedbackModel);
