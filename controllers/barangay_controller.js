const Barangay = require('../models/barangay_model');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const Authorized = require('../models/authorized_model')

// @desc    Setup barangay Information
// @access  Private
const setupBarangayInfo = asyncHandler(async (args) => {
    const { authorizedId, barangayInfo } = args;

    const authorized = await Authorized.findById(authorizedId)
    if(!authorized) throw new ApolloError("Authorized Personnel not found")


    const barangay = await Barangay.create({
        barangayInfo
    });

    if (barangay) {
        authorized.barangay = barangay._id
        authorized.save()
        return barangay
    } else {
        throw new ApolloError('Invalid data format');
    }
});

// @desc    Setup barangay officials
// @access  Private
const setupBarangayOfficial = asyncHandler(async (args) => {
    const { barangay_id, barangayOfficials } = args;
    const barangay = await Barangay.findById(barangay_id);

    barangay.barangayOfficials = barangayOfficials

    barangay.save()

    if (barangay) return barangay
    else throw new ApolloError('Invalid data format');
});

// @desc    Setup barangay images and map
// @access  Private
const setupBarangayImages = asyncHandler(async (args) => {
    const { barangay_id, images, barangayMap } = args;

    const barangay = await Barangay.findById(barangay_id)

    if (!barangay) throw new ApolloError('Barangay not found')

    barangay.images = images
    barangay.barangayMap = barangayMap
    barangay.save()

    if (barangay)
        return barangay
});

// @desc    Update barangay 
// @access  Private || Admin
const updateBarangay = asyncHandler(async (args) => {
    const barangay = await Barangay.findById(args.barangay_id)
    if (barangay) {
        barangay.barangayInfo = args.barangayInfo || barangay.barangayInfo
        barangay.barangayOfficials = args.barangayOfficials || barangay.barangayOfficials
        barangay.images = args.images || barangay.images
        barangay.barangayMap = args.barangayMap || barangay.barangayMap

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
const getBarangay = asyncHandler(async (args) => {
    const { barangayId } = args
    
    const barangay = await Barangay.findById(barangayId)

    if(!barangay) throw new ApolloError("Barangay not found with this id!")

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
    setupBarangayInfo,
    setupBarangayOfficial,
    setupBarangayImages,
    updateBarangay,
    deleteBarangay,
    getBarangay,
    getAllBarangay
};
