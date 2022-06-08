const Request = require('../models/requestModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const ActivityLog = require('../models/activitylogModel')
const userNotification = require('../models/userNotificationModel');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')
const moment = require('moment')
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
        const activity = await ActivityLog.findOne({ user: user})
        const data = {
            type: "request",
            description: `You successfully requested ${barangay_request.request}`,
            activityId: barangay_request._id
        }

        activity.activities.push(data)
        activity.save()

        return barangay_request.populate({
            path: 'user',
            select: '_id email isVerified hasNewNotif image'
        })
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

        return updated_request.populate({
            path: 'user',
            select: '_id email isVerified hasNewNotif image'
        })
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
    const request = await Request.findById(args.id).populate({
        path: 'user',
        select: '_id email  isVerified'
    });

    if (request) {
        return request.populate({
            path: 'user',
            select: '_id email isVerified hasNewNotif image'
        })

    } else {
        throw new ApolloError('Request not found');
    }
});

// @desc    Get all barangay request
// @access  Private && Admin
const getAllRequests = asyncHandler(async () => {
    const requests = await Request.find().populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

    return requests
});

// @desc    Get all barangay request
// @access  Private && Admin
const getFilterRequests = asyncHandler(async (args) => {
    const value = args.value.toLowerCase()
    const requests = await Request.find({
        "$or": [
            { request: { $regex: value } },
            { purpose: { $regex: value } },
            { status: { $regex: value } },
            { transactionId: { $regex: value } }
        ]
    }).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

    return requests
});

// @desc    Get all barangay request of current logged in user
// @access  Private
const getUserRequests = asyncHandler(async (args) => {
    const requests = await Request.find({ user: args.user_id }).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

    if (requests) {
        return requests
    }
});

// @desc    Update barangay request
// @access  Private || Admin
const changeRequestStatus = asyncHandler(async (args) => {
    const { request_id, status } = args

    const request = await Request.findById(request_id)

    let data = null

    if (status === 'ready')
        data = {
            type: "request",
            description: `Your ${request.request} is ready to claim.`,
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
        // Check if user existed
        const user = await User.findById(request.user)
        if (!user) throw new ApolloError('User not found')
        // Check if user's notification existed
        const notification = await userNotification.findOne({ user: user })
        if (!notification) throw new ApolloError('Notication not found')

        request.status = status
        const updated_request = await request.save()

        if (updated_request) {
            notification.notifications.push(data)
            notification.save()
            return updated_request.populate({
                path: 'user',
                select: '_id email isVerified hasNewNotif'
            })
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
    }).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

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
    getRequestsByDate
};
