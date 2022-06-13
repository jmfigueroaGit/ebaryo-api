const mongoose = require('mongoose')

const Notification = new mongoose.Schema({
    type: {
        type: String,
        enum: ['authorized', 'survey', 'request', 'report', 'feedback', 'chatbot']
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
    }
})

const adminNotificationSchema = new mongoose.Schema(
    {
        authorized: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Authorized',
		},
        notifications: [Notification]
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.adminNotificationSchema ||
    mongoose.model('AdminNotification', adminNotificationSchema);
