const Request = require('../models/requestModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { ApolloError } = require('apollo-server')

// @desc    Create barangay request
// @access  Private
const createRequest = asyncHandler(async (args) => {
    const { user_id, request, purpose } = args;

    const user = await User.findById(user_id)

    if (user.isVerified === false) {
        throw new ApolloError('User must verified first')
    }

    const barangay_request = await Request.create({
        user: user_id,
        request,
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
        select: '_id email isAdmin isVerified'
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
        select: '_id email isAdmin isVerified'
    })

    return requests
});

// @desc    Get all barangay request of current logged in user
// @access  Private
const getUserRequests = asyncHandler(async (args) => {
    const requests = await Request.find({ user: args.user_id }).populate({
        path: 'user',
        select: '_id email isAdmin isVerified'
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
};
