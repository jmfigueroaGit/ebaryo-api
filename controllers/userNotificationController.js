const userNotification = require('../models/userNotificationModel');
const ActivityLog = require('../models/activitylogModel');
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

// @desc    Get barangay
// @access  Private 
const getActivityLogById = asyncHandler(async (args) => {
    const activitylog = await ActivityLog.findOne({ user: args.userId }).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

    if (activitylog) {
        return activitylog
    } else {
        throw new ApolloError('Activity logs not found');
    }
});


module.exports = {
    getNotificationById,
    getActivityLogById
};
