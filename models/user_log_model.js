const mongoose = require('mongoose')

const Activity = new mongoose.Schema({
    type: {
        type: String,
        enum: ['user', 'survey', 'request']
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now()
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
    }
})

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        activities: [Activity]
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.ActivityLog ||
    mongoose.model('ActivityLog', activityLogSchema);
