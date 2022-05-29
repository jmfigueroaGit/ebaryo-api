const userNotification = require('../models/userNotificationModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')


// @desc    Get barangay
// @access  Private 
const getNotificationById = asyncHandler(async (args) => {
    const notification = await userNotification.findOne({ user: args.notif_id }).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

    if (notification) {
        return notification
    } else {
        throw new ApolloError('Notification not found');
    }
});

module.exports = {
    getNotificationById
};
