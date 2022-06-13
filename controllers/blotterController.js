const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')
const Blotter = require('../models/blotterModel');
const Adminlog = require('../models/adminlogModel')
const moment = require('moment')
// @desc    Create blotter
// @access  Private
const createBlotter = asyncHandler(async (args) => {
    const { caseType, description, complainant, defendant, authorized_id } = args

    const blotters = await Blotter.find()
    const running = leadingzero(blotters.length + 1, 4)
    const bltrId = 'bltr-22-' + running

    const blotter = await Blotter.create({
        caseType,
        description,
        complainant,
        defendant,
        bltrId
    })

    if (blotter){ 
        const activityLogs = await Adminlog.findOne({ authorized: authorized_id})
        const adminActivity = {
            type: "blotter",
            title: "Created a blotter",
            description: `${blotter.caseType} - ${blotter.bltrId.toUpperCase()}`,
            activityId: blotter._id
        }
        activityLogs.activities.push(adminActivity)
        activityLogs.save()
        return blotter
    }
    else throw new ApolloError('Invalid data input')
})

const getBlotters = asyncHandler(async () => {
    const blotters = await Blotter.find()

    return blotters
})

const getBlotter = asyncHandler(async (args) => {
    const blotter = await Blotter.findById(args.blotter_id)

    if (!blotter) throw new ApolloError("Blotter not found")
    return blotter
})

const updateBlotter = asyncHandler(async (args) => {
    const { blotter_id, caseType, description, defendant, complainant } = args

    const blotter = await Blotter.findById(blotter_id)
    if (!blotter) throw new ApolloError("Blotter not found")

    blotter.caseType = caseType || blotter.caseType
    blotter.description = description || blotter.description
    blotter.defendant = defendant || blotter.defendant
    blotter.complainant = complainant || blotter.complainant

    const updatedBlotter = blotter.save()

    if (blotter) return updatedBlotter
    else throw new ApolloError("Invalid data input")
})

const statusBlotter = asyncHandler(async (args) => {
    const { blotter_id, status, authorized_id } = args


    const blotter = await Blotter.findById(blotter_id)
    if (!blotter) throw new ApolloError("Blotter not found")

    blotter.status = status || blotter.status
    const updatedStatus = blotter.save()

    if (updatedStatus){ 
        const activityLogs = await Adminlog.findOne({ authorized: authorized_id})
        const adminActivity = {
            type: "blotter",
            title: "Update blotter status",
            description: `${blotter.caseType} - ${blotter.bltrId.toUpperCase()}`,
            activityId: blotter._id
        }
        activityLogs.activities.push(adminActivity)
        activityLogs.save()
        return updatedStatus
    }
    else throw new ApolloError("Invalid data input")
})

const getFilterBlotter = asyncHandler(async (args) => {
    const value = args.value
    const blotters = await Blotter.find({
        "$or": [
            { bltrId: { $regex: args.value.toLowerCase() } },
            { caseType: { $regex: args.value } },
            { status: { $regex: value.toLowerCase() } },
            { complainant: { $regex: value } },
            { defendant: { $regex: value } },
            { description: { $regex: value } },
        ]
    })

    return blotters
});

const getBlottersFilteredDate = asyncHandler(async (args) => {
    let start = moment(args.startDate).format('yyyy-MM-DD');
    let end = moment(args.endDate).format('yyyy-MM-DD');
    const blotters = await Blotter.find({
        createdAt: {
            $gte: start,
            $lte: end
        }
    })

    return blotters
})

module.exports = {
    createBlotter,
    updateBlotter,
    getBlotter,
    getBlotters,
    statusBlotter,
    getFilterBlotter,
    getBlottersFilteredDate
}