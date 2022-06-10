const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')
const Blotter = require('../models/blotterModel');

// @desc    Create blotter
// @access  Private
const createBlotter = asyncHandler(async (args) => {
    const { caseType, description, complainant, defendant } = args

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

    if (blotter) return blotter
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
    const { blotter_id, status } = args


    const blotter = await Blotter.findById(blotter_id)
    if (!blotter) throw new ApolloError("Blotter not found")

    blotter.status = status || blotter.status
    const updatedStatus = blotter.save()

    if (updatedStatus) return updatedStatus
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

module.exports = {
    createBlotter,
    updateBlotter,
    getBlotter,
    getBlotters,
    statusBlotter,
    getFilterBlotter
}