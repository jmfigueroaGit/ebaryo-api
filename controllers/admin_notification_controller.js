const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const AdminNotification = require('../models/admin_notification_model')

// @desc    Get barangay
// @access  Private 
const getNotificationById = asyncHandler(async (args) => {
    const { notifId } = args
    const notification = await AdminNotification.findOne({ admin: notifId }).populate({
        path: 'admin',
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