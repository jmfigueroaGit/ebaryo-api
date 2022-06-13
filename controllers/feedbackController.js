const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')
const Feedback = require('../models/feedbackModel');
const Adminlog = require('../models/adminlogModel')
const AdminNotification = require('../models/adminNotification')
const moment = require('moment')
const Authorized = require('../models/authorizedModel')
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

    if (feedback){ 
        const authorized = await Authorized.updateMany({}, { $set: { hasNewNotif: true } });

        const feedbackUser = await User.findById(user_id)

        const authorizedData = {
            type: "feedback",
            description: `New feedback sent by ${feedbackUser.name}`,
            notifId: feedback._id
        }

        const notification = await AdminNotification.find();

        for (let i = 0; i < notification.length; i++) {
            notification[i].notifications.push(authorizedData)
            notification[i].save()
        }
        if(authorized && notification){
            return feedback.populate({
                path: 'user',
                select: '_id name email isVerified hasNewNotif image'
            })
        }
    }
    else throw new ApolloError('Invalid data formatted')
})


// @desc    GET ALL barangay feedbacks
// @access  Private
const getFeedbacks = asyncHandler(async () => {
    const feedbacks = await Feedback.find().populate({
        path: 'user',
        select: '_id name email isVerified hasNewNotif image'
    })

    if (feedbacks) return feedbacks
    else throw new ApolloError('Invalid data formatted')
})
// @desc    GET Single barangay feedback
// @access  Private
const getFeedback = asyncHandler(async (args) => {
    const feedback = await Feedback.findById(args.feedback_id).populate({
        path: 'user',
        select: '_id name email isVerified hasNewNotif image'
    })

    if (feedback) return feedback
    else throw new ApolloError('Feedback not found')
})

// @desc    Update feedback status
// @access  Private
const updateFeedbackStatus = asyncHandler(async (args) => {
    const { feedback_id, status, authorized_id } = args
    const feedback = await Feedback.findById(feedback_id).populate({
        path: 'user',
        select: '_id name email isVerified hasNewNotif image'
    })

    if (!feedback) throw new ApolloError('Feedback not found')

    feedback.status = status || feedback.status
    feedback.save()

    if (feedback){ 
        const activityLogs = await Adminlog.findOne({ authorized: authorized_id})
        const adminActivity = {
            type: "feedback",
            title: "Update feedback status",
            description: `${feedback.description} - ${feedback.fdbkId.toUpperCase()}`,
            activityId: feedback._id
        }
        activityLogs.activities.push(adminActivity)
        activityLogs.save()
        return feedback
    }
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
            select: '_id name email isVerified hasNewNotif image'
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
            select: '_id name email isVerified hasNewNotif image'
        })
    
        return feedbacks
    }
})

// @desc    GET ALL barangay feedbacks
// @access  Private
const getFeedbacksFilteredDate = asyncHandler(async (args) => {
    let start = moment(args.startDate).format('yyyy-MM-DD');
    let end = moment(args.endDate).format('yyyy-MM-DD');
    const feedbacks = await Feedback.find({
        createdAt: {
            $gte: start,
            $lt: end
        }
    }).populate({
        path: 'user',
        select: '_id name email isVerified hasNewNotif image'
    })

    if (feedbacks) return feedbacks
    else throw new ApolloError('Invalid data formatted')
})

module.exports = {
    createFeedback,
    getFeedbacks,
    getFeedback,
    updateFeedbackStatus,
    filterFeedbacks,
    getFeedbacksFilteredDate
}