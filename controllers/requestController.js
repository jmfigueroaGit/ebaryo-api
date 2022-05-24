const Request = require('../models/requestModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')

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
        return barangay_request
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

        return updated_request
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
        return request

    } else {
        throw new ApolloError('Request not found');
    }
});

// @desc    Get all barangay request
// @access  Private && Admin
const getAllRequests = asyncHandler(async () => {
    const requests = await Request.find().populate({
        path: 'user',
        select: '_id email  isVerified '
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
        select: '_id email  isVerified '
    })

    return requests
});

// @desc    Get all barangay request of current logged in user
// @access  Private
const getUserRequests = asyncHandler(async (args) => {
    const requests = await Request.find({ user: args.user_id }).populate({
        path: 'user',
        select: '_id email  isVerified'
    });

    if (requests) {
        return requests
    }
});

module.exports = {
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    getAllRequests,
    getUserRequests,
    getFilterRequests
};
