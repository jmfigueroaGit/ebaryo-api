const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const AuthorizedNotification = require('../models/authorized_notification_model')

// @desc    Get barangay
// @access  Private 
const getNotificationById = asyncHandler(async (args) => {
    const notification = await AuthorizedNotification.findOne({ authorized: args.authorizedId }).populate({
        path: 'authorized',
        populate: {
            path: 'barangay'
        }})

    if (notification) {
        return notification
    } else {
        throw new ApolloError('Notification not found');
    }
});

module.exports = {
    getNotificationById
};