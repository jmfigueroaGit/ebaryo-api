const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')

const ActivityLog = require('../models/user_log_model');

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
    getActivityLogById
};
