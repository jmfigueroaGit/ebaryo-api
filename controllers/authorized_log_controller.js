const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const AuthorizedLog = require('../models/authorized_log_model')

// @desc    Get barangay
// @access  Private 
const getActivityLogById = asyncHandler(async (args) => {
    const activitylog = await AuthorizedLog.findOne({ authorized: args.authorizedId }).populate({
        path: 'authorized',
        populate: {
            path: 'barangay',
        }})

    if (activitylog) {
        return activitylog
    } else {
        throw new ApolloError('Activity logs not found');
    }
});

const getActivityLogs = asyncHandler(async (args) => {
    const activitylogs = await AuthorizedLog.find().populate({
        path: 'authorized',
        populate: {
            path: 'barangay',
        }})

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
