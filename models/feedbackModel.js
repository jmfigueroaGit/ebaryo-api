const mongoose = require('mongoose');

const feedbackModel = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true
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
            default: 'Unread',
            enum: ['Unread', 'Prioritized', 'Read', 'Actioned', 'Archived']
        }
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.Feedback ||
    mongoose.model('Feedback', feedbackModel);
