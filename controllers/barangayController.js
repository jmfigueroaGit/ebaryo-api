const Barangay = require('../models/barangayModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')

// @desc    Create barangay 
// @access  Private
const createBarangay = asyncHandler(async (args) => {

    const { barangayInfo, barangayOfficials, images } = args;
    const barangay = await Barangay.create({
        barangayInfo,
        barangayOfficials,
        images,
    });

    if (barangay) {
        return barangay
    } else {
        throw new ApolloError('Invalid data format');
    }
});

// @desc    Update barangay 
// @access  Private || Admin
const updateBarangay = asyncHandler(async (args) => {
    const barangay = await Barangay.findById(args.barangay_id)
    if (barangay) {
        barangay.barangayInfo = args.barangayInfo || barangay.barangayInfo
        barangay.barangayOfficials = args.barangayOfficials || barangay.barangayOfficials
        barangay.images = args.images || barangay.images

        const updated_barangay = await barangay.save()

        return updated_barangay
    } else {
        throw new ApolloError('Barangay not existed with this ID')
    }
});

// @desc    Delete barangay 
// @access  Private || Admin
const deleteBarangay = asyncHandler(async (args) => {
    const barangay = await Barangay.findById(args.barangay_id);

    if (barangay) {
        await barangay.remove();
        return { message: 'Barangay removed' }
    } else {
        throw new ApolloError('Barangay not found');
    }
});

// @desc    Get barangay
// @access  Private 
const getBarangayById = asyncHandler(async (args) => {
    const barangay = await Barangay.findById(args.id)

    if (barangay) {
        return barangay

    } else {
        throw new ApolloError('Barangay not found');
    }
});

// @desc    Get all barangay 
// @access  Private && Admin
const getAllBarangay = asyncHandler(async () => {
    const barangays = await Barangay.find()
    return barangays
});

module.exports = {
    createBarangay,
    updateBarangay,
    deleteBarangay,
    getBarangayById,
    getAllBarangay
};
