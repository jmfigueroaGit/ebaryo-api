const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')

const userNotification = require('../models/user_notification_model');

// @desc    Get barangay
// @access  Private 
const getNotificationById = asyncHandler(async (args) => {
    const notification = await userNotification.findOne({ user: args.notif_id }).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image createdAt'
    })

    if (notification) {
        return notification
    } else {
        throw new ApolloError('Notification not found');
    }
});

module.exports = {
    getNotificationById,
};
