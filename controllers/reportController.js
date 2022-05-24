const Report = require('../models/reportModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { ApolloError } = require('apollo-server')

// @desc    Create barangay report
// @access  Private
const createReport = asyncHandler(async (args) => {
    const { user_id, report, description } = args;

    const user = await User.findById(user_id)

    if (user.isVerified === false) {
        throw new ApolloError('User must verified first')
    }

    const barangay_report = await Report.create({
        user: user_id,
        report,
        description,
    })

    if (barangay_report) {
        return barangay_report
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

        return updated_report
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
    const report = await Report.findById(args.id).populate({
        path: 'user',
        select: '_id email isAdmin isVerified'
    });

    if (report) {
        return report

    } else {
        throw new ApolloError('Report not found');
    }
});

// @desc    Get all barangay report
// @access  Private && Admin
const getAllReports = asyncHandler(async () => {
    const reports = await Report.find().populate({
        path: 'user',
        select: '_id email isAdmin isVerified'
    })

    return reports
});

const getFilterReports = asyncHandler(async (args) => {
    const value = args.value.toLowerCase()
    const reports = await Report.find({
        "$or": [
            { report: { $regex: args.value } },
            { description: { $regex: args.value } },
            { status: { $regex: value } },
            { transactionId: { $regex: value } }
        ]
    }).populate({
        path: 'user',
        select: '_id email slugId isVerified'
    })
    return reports
});

// @desc    Get all barangay reports of current logged in user
// @access  Private
const getUserReports = asyncHandler(async (args) => {
    const reports = await Report.find({ user: args.user_id }).populate({
        path: 'user',
        select: '_id email isAdmin isVerified'
    });

    if (reports) {
        return reports
    }
});

module.exports = {
    createReport,
    updateReport,
    deleteReport,
    getReportById,
    getAllReports,
    getUserReports,
    getFilterReports
};
