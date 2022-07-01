const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')
const moment = require('moment')

const Request = require('../models/request_model');
const User = require('../models/user_model');
const ActivityLog = require('../models/user_log_model')
const userNotification = require('../models/user_notification_model');
const Authorizedlog = require('../models/authorized_log_model')
const AuthorizedNotification = require('../models/authorized_notification_model')
const Authorized = require('../models/authorized_model')

// @desc    Create barangay request
// @access  Private
const createRequest = asyncHandler(async (args) => {
    const { user_id, request, purpose } = args;

    const user = await User.findById(user_id)
    const requestLength = await Request.find()
    const running = leadingzero(requestLength.length + 1, 4)
    const transactionId = 'rqst-22-' + running;
    if (user.isVerified === false) {
        throw new ApolloError('User must verified first')
    }

    const barangay_request = await Request.create({
        user: user_id,
        request,
        transactionId,
        purpose,
    });

    if (barangay_request) {
        // Must have a notification in admin and authorized person of assigned barangay
        const activity = await ActivityLog.findOne({ user: user})
        const data = {
            type: "request",
            description: `You successfully requested ${barangay_request.request}`,
            activityId: barangay_request._id
        }

        activity.activities.push(data)
        activity.save()

        const authorized = await Authorized.updateMany({}, { $set: { hasNewNotif: true } });

        const authorizedData = {
            type: "request",
            description: `New document request by ${user.name}`,
            notifId: barangay_request._id
        }

        const notification = await AuthorizedNotification.find();

        for (let i = 0; i < notification.length; i++) {
            notification[i].notifications.push(authorizedData)
            notification[i].save()
        }

        return barangay_request.populate('user')
        
    } else {
        throw new ApolloError('Invalid data format');
    }
});

// @desc    Update barangay request
// @access  Private || Admin
const updateRequest = asyncHandler(async (args) => {
    const request = await Request.findById(args.request_id)

    if (request) {
        request.purpose = args.purpose || request.purpose
        request.request = args.request || request.request

        const updated_request = await request.save()

        return updated_request.populate('user')
    } else {
        throw new ApolloError('Request not existed with this ID')
    }
});

// @desc    Delete barangay request
// @access  Private || Admin
const deleteRequest = asyncHandler(async (args) => {
    const request = await Request.findById(args.request_id);

    if (request) {
        await request.remove();
        return { message: 'Request removed' }
    } else {
        throw new ApolloError('Request not found');
    }
});

// @desc    Get barangay request
// @access  Private || Admin
const getRequestById = asyncHandler(async (args) => {
    const request = await Request.findById(args.id).populate('user');

    if (request) {
        return request

    } else {
        throw new ApolloError('Request not found');
    }
});

// @desc    Get all barangay request
// @access  Private && Admin
const getAllRequests = asyncHandler(async () => {
    const requests = await Request.find().populate('user')

    return requests
});

// @desc    Get all barangay request
// @access  Private && Admin
const getFilterRequests = asyncHandler(async (args) => {
    const value = args.value
    const user = await User.findOne({ email: value })
    if(user){
        const requests = Request.find({ user: user._id })
        return requests.populate('user')
    }
    else{
        const requests = await Request.find({
            "$or": [
                { request: { $regex: value } },
                { purpose: { $regex: value } },
                { status: { $regex: value.toLowerCase() } },
                { transactionId: { $regex: value.toLowerCase() } }
            ]
        }).populate('user')
    
        return requests
    }
});

// @desc    Get all barangay request of current logged in user
// @access  Private
const getUserRequests = asyncHandler(async (args) => {
    const requests = await Request.find({ user: args.user_id }).populate('user')

    if (requests) {
        return requests
    }
});

// @desc    Update barangay request
// @access  Private || Admin
const changeRequestStatus = asyncHandler(async (args) => {
    const { request_id, status, authorized_id } = args

    const request = await Request.findById(request_id)

    let data = null

    if (status === 'for release')
        data = {
            type: "request",
            description: `Your ${request.request} is ready to claim.`,
            notifId: request_id
        }
    else if (status === 'on process')
        data = {
            type: "request",
            description: `Your ${request.request} is on process.`,
            notifId: request_id
        }
    else if (status === 'claimed')
        data = {
            type: "request",
            description: `Your ${request.request} is successfully claimed.`,
            notifId: request_id
        }
    else if (status === 'rejected')
        data = {
            type: "request",
            description: `Your ${request.request} is rejected.`,
            notifId: request_id
        }

    if (request) {
        const activityLogs = await Authorizedlog.findOne({ authorized: authorized_id})
        const adminActivity = {
            type: "request",
            title: "Update request status",
            description: `${request.request} - ${request.transactionId.toUpperCase()}`,
            activityId: request._id
        }
        activityLogs.activities.push(adminActivity)
        activityLogs.save()
        // Check if user existed
        const user = await User.findById(request.user)
        if (!user) throw new ApolloError('User not found')
        // Check if user's notification existed
        const notification = await userNotification.findOne({ user: user })
        if (!notification) throw new ApolloError('Notication not found')
        user.hasNewNotif = true;
        user.save()
        request.status = status
        const updated_request = await request.save()

        if (updated_request) {
            notification.notifications.push(data)
            notification.save()
            return updated_request.populate('user')
        }
    } else {
        throw new ApolloError('Request not existed with this ID')
    }
});

// @desc    Get all barangay request by date
// @access  Private && Admin
const getRequestsByDate = asyncHandler(async (args) => {
    const today = moment().startOf('day').subtract(args.value, 'day')
    const requests = await Request.find({
        createdAt: {
            $gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()
        }
    }).populate('user')

    return requests
});

// @desc    Get all barangay request by date
// @access  Private && Admin
const getRequestsFilteredDate = asyncHandler(async (args) => {
    let start = moment(args.startDate).format('yyyy-MM-DD');
    let end = moment(args.endDate).format('yyyy-MM-DD');
    const requests = await Request.find({
        createdAt: {
            $gte: start,
            $lt: end
        }
    }).populate('user')
    return requests
});


module.exports = {
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    getAllRequests,
    getUserRequests,
    getFilterRequests,
    changeRequestStatus,
    getRequestsByDate,
    getRequestsFilteredDate
};
