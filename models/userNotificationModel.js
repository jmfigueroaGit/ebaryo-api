const mongoose = require('mongoose')

const userNotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        notifications: [
            {
                type: {
                    type: String,
                    enum: ['user', 'survey', 'annoucement', 'article', 'request']
                },
                description: {
                    type: String,
                },
                date: {
                    type: Date,
                    default: Date.now()
                },
                notifId: {
                    type: mongoose.Schema.Types.ObjectId,
                    unique: true
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.userNotification ||
    mongoose.model('userNotification', userNotificationSchema);
