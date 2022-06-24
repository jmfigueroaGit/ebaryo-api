const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const AuthorizedNotification = require('../models/authorized_notification_model')

// @desc    Get barangay
// @access  Private 
const getNotificationById = asyncHandler(async (args) => {
    const notification = await AuthorizedNotification.findOne({ authorized: args.notifId }).populate({
        path: 'authorized',
        select: '_id image hasNewNotif name email phoneNumber sex position isActive createdAt'})

    if (notification) {
        return notification
    } else {
        throw new ApolloError('Notification not found');
    }
});

module.exports = {
    getNotificationById
};