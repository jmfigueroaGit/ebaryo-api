const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')
const Feedback = require('../models/feedbackModel');

// @desc    Create barangay feedback
// @access  Private
const createFeedback = asyncHandler(async (args) => {
    const { user_id, description } = args

    const user = User.findById(user_id)

    if (!user) throw new ApolloError("User not found")

    const feedbacks = await Feedback.find()
    const running = leadingzero(feedbacks.length + 1, 4)
    const fdbkId = 'fbdk-22-' + running

    const feedback = await Feedback.create({
        user: user_id,
        description,
        fdbkId
    })

    if (feedback) return feedback.populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })
    else throw new ApolloError('Invalid data formatted')
})


// @desc    GET ALL barangay feedbacks
// @access  Private
const getFeedbacks = asyncHandler(async () => {
    const feedbacks = await Feedback.find().populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

    if (feedbacks) return feedbacks
    else throw new ApolloError('Invalid data formatted')
})
// @desc    GET Single barangay feedback
// @access  Private
const getFeedback = asyncHandler(async (args) => {
    const feedback = await Feedback.findById(args.feedback_id).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

    if (feedback) return feedback
    else throw new ApolloError('Feedback not found')
})

// @desc    Update feedback status
// @access  Private
const updateFeedbackStatus = asyncHandler(async (args) => {
    const { feedback_id, status } = args
    const feedback = await Feedback.findById(feedback_id).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })

    if (!feedback) throw new ApolloError('Feedback not found')

    feedback.status = status || feedback.status
    feedback.save()

    if (feedback) return feedback
    else throw new ApolloError('Invalid data formatted')
})

// @desc    GET ALL barangay feedbacks
// @access  Private
const filterFeedbacks = asyncHandler(async (args) => {
    const value = args.value
    const user = await User.findOne({ email: value })
    if(user){
        const feedbacks = await Feedback.find({ user: user._id }).populate({
            path: 'user',
            select: '_id email isVerified hasNewNotif image'
        })
        return feedbacks
    }
    else{
        const feedbacks = await Feedback.find({
            "$or": [
                { description: { $regex: args.value } },
                { fdbkId: { $regex: args.value.toLowerCase() } },
                { status: { $regex: value.toLowerCase() } },
            ]
        }).populate({
            path: 'user',
            select: '_id email isVerified hasNewNotif image'
        })
    
        if (feedbacks) return feedbacks
        else throw new ApolloError('Invalid data formatted')
    }
})

module.exports = {
    createFeedback,
    getFeedbacks,
    getFeedback,
    updateFeedbackStatus,
    filterFeedbacks
}