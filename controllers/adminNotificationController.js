const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const Adminlog = require('../models/adminlogModel')
const AdminNotification = require('../models/adminNotification')

// @desc    Get barangay
// @access  Private 
const getNotificationById = asyncHandler(async (args) => {
    const notification = await AdminNotification.findOne({ authorized: args.notifId }).populate({
        path: 'authorized',
        select: '_id image hasNewNotif name email phoneNumber sex position role isActive createdAt'})

    if (notification) {
        return notification
    } else {
        throw new ApolloError('Notification not found');
    }
});

// @desc    Get barangay
// @access  Private 
const getActivityLogById = asyncHandler(async (args) => {
    const activitylog = await Adminlog.findOne({ authorized: args.userId }).populate({
        path: 'authorized',
        select: '_id image hasNewNotif name email phoneNumber sex position role isActive createdAt'})

    if (activitylog) {
        return activitylog
    } else {
        throw new ApolloError('Activity logs not found');
    }
});

const getActivityLogs = asyncHandler(async (args) => {
    const activitylogs = await Adminlog.find().populate({
        path: 'authorized',
        select: '_id image hasNewNotif name email phoneNumber sex position role isActive createdAt'})

    if (activitylogs) {
        return activitylogs
    } else {
        throw new ApolloError('Activity logs not found');
    }
});

module.exports = {
    getNotificationById,
    getActivityLogById,
    getActivityLogs
};
