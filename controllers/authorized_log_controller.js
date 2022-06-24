const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const AuthorizedLog = require('../models/authorized_log_model')

// @desc    Get barangay
// @access  Private 
const getActivityLogById = asyncHandler(async (args) => {
    const activitylog = await AuthorizedLog.findOne({ authorized: args.userId }).populate({
        path: 'authorized',
        select: '_id image hasNewNotif name email phoneNumber sex position isActive createdAt'})

    if (activitylog) {
        return activitylog
    } else {
        throw new ApolloError('Activity logs not found');
    }
});

const getActivityLogs = asyncHandler(async (args) => {
    const activitylogs = await AuthorizedLog.find().populate({
        path: 'authorized',
        select: '_id image hasNewNotif name email phoneNumber sex position isActive createdAt'})

    if (activitylogs) {
        return activitylogs
    } else {
        throw new ApolloError('Activity logs not found');
    }
});

module.exports = {
    getActivityLogById,
    getActivityLogs
};
