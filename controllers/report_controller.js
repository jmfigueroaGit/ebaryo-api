const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')
const moment = require('moment')

const Report = require('../models/report_model');
const User = require('../models/user_model');
const Authorizedlog = require('../models/authorized_log_model')
const AuthorizedNotification = require('../models/authorized_notification_model')
const Authorized = require('../models/authorized_model')

// @desc    Create barangay report
// @access  Private
const createReport = asyncHandler(async (args) => {
    const { user_id, report, description } = args;


    const user = await User.findById(user_id)
    if (!user) throw new ApolloError("User not found")
    const reportLength = await Report.find()
    const running = leadingzero(reportLength.length + 1, 4)
    const transactionId = 'rprt-22-' + running;
    if (user.isVerified === false) {
        throw new ApolloError('User must verified first')
    }

    const barangay_report = await Report.create({
        user: user_id,
        report,
        transactionId,
        description,
    })

    // Must have a notification in admin and authorized person of assigned barangay
    if (barangay_report) {
        const authorized = await Authorized.updateMany({}, { $set: { hasNewNotif: true } });

        const authorizedData = {
            type: "report",
            description: `New report by ${user.name}`,
            notifId: barangay_report._id
        }

        const notification = await AuthorizedNotification.find();

        for (let i = 0; i < notification.length; i++) {
            notification[i].notifications.push(authorizedData)
            notification[i].save()
        }
        if(authorized && notification){
            return barangay_report.populate('user')
        }
    } else {
        throw new ApolloError('Invalid data format');
    }
});

// @desc    Update barangay report
// @access  Private || Admin
const updateReport = asyncHandler(async (args) => {
    const report = await Report.findById(args.report_id)

    if (report) {
        report.description = args.description || request.description
        report.report = args.report || report.report

        const updated_report = await report.save()

        return updated_report.populate('user')
    } else {
        throw new ApolloError('Report not existed with this ID')
    }
});

// @desc    Delete barangay report
// @access  Private || Admin
const deleteReport = asyncHandler(async (args) => {
    const report = await Report.findById(args.report_id);

    if (report) {
        await report.remove();
        return { message: 'Report removed' }
    } else {
        throw new ApolloError('Report not found');
    }
});

// @desc    Get barangay report
// @access  Private || Admin
const getReportById = asyncHandler(async (args) => {
    const report = await Report.findById(args.id).populate('user')

    if (report) {
        return report
    } else {
        throw new ApolloError('Report not found');
    }
});

// @desc    Get all barangay report
// @access  Private && Admin
const getAllReports = asyncHandler(async () => {
    const reports = await Report.find().populate('user')

    return reports
});

const getFilterReports = asyncHandler(async (args) => {
    const value = args.value
    const user = await User.findOne({ email: value })
    if(user){
        const reports = await Report.find({ user: user._id }).populate('user')
        return reports
    }
    else{
        const reports = await Report.find({
            "$or": [
                { report: { $regex: args.value.toUpperCase() } },
                { description: { $regex: args.value } },
                { status: { $regex: value.toLowerCase() } },
                { transactionId: { $regex: value.toLowerCase() } },
            ]
        }).populate({
            path: 'user',
            select: '_id name email isVerified hasNewNotif image'
        })
        return reports
    }
});

// @desc    Get all barangay reports of current logged in user
// @access  Private
const getUserReports = asyncHandler(async (args) => {
    const reports = await Report.find({ user: args.user_id }).populate('user')

    if (reports) {
        return reports
    }
});

// @desc    Get all barangay report by date
// @access  Private && Admin
const getAllReportsByDate = asyncHandler(async (args) => {
    const today = moment().startOf('day').subtract(args.value, 'day')
    const reports = await Report.find({
        createdAt: {
            $gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()
        }
    }).populate('user')

    return reports
});

// @desc    Update feedback status
// @access  Private
const updateReportStatus = asyncHandler(async (args) => {
    const { report_id, status, authorized_id } = args
    const report = await Report.findById(report_id).populate('user')

    if (!report) throw new ApolloError('Report not found')

    report.status = status || report.status
    report.save()

    if (report){ 
        const activityLogs = await Authorizedlog.findOne({ authorized: authorized_id })
        const adminActivity = {
            type: "report",
            title: `Update report status to ${status}`,
            description: `${report.report} - ${report.transactionId.toUpperCase()}`,
            activityId: report._id
        }
        activityLogs.activities.push(adminActivity)
        activityLogs.save()
        return report
    }
    else throw new ApolloError('Invalid data formatted')
})

const getReportsFilteredDate = asyncHandler(async (args) => {
    let start = moment(args.startDate).format('yyyy-MM-DD');
    let end = moment(args.endDate).format('yyyy-MM-DD');
    const reports = await Report.find({
        createdAt: {
            $gte: start,
            $lt:end
        }
    }).populate('user')

    return reports
});


module.exports = {
    createReport,
    updateReport,
    deleteReport,
    getReportById,
    getAllReports,
    getUserReports,
    getFilterReports,
    getAllReportsByDate,
    updateReportStatus,
    getReportsFilteredDate
};
