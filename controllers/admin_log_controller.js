const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const Adminlog = require('../models/admin_log_model')

// @desc    Get Admin's Activity Logs
// @access  Private || Admin
const getActivityLogById = asyncHandler(async (args) => {
    const { adminId } = args
    const activitylog = await Adminlog.findOne({ admin: adminId }).populate({
        path: 'admin',
        select: '_id image hasNewNotif name email phoneNumber sex position isActive createdAt'})

    if (activitylog) {
        return activitylog
    } else {
        throw new ApolloError('Activity logs not found');
    }
});


// @desc    Get All Admin's Activity Logs
// @access  Private || Admin
const getActivityLogs = asyncHandler(async (args) => {
    const activitylogs = await Adminlog.find().populate({
        path: 'admin',
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
