const userNotification = require('../models/userNotificationModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')


// @desc    Get barangay
// @access  Private 
const getNotificationById = asyncHandler(async (args) => {
    const notification = await userNotification.findById(args.id)

    if (notification) {
        return notification

    } else {
        throw new ApolloError('Notification not found');
    }
});

module.exports = {
    getNotificationById
};
