const Barangay = require('../models/barangayModel');
const Authorized = require('../models/authorizedModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// @desc    Setup barangay Information
// @access  Private
const setupBarangayInfo = asyncHandler(async (args) => {
    const { barangayInfo, authorized } = args;
   
    const personnel = await Authorized.findById(authorized)
    if(!personnel) throw new ApolloError('Personnel not found');
    // if(personnel.role !== "Admin") throw new ApolloError('Personnel is not allowed to access this route.');
    // const barangays = await Barangay.findOne({authorized: personnel._id})

    // if(barangays) throw new ApolloError('Admin already created barangay information');

    const barangay = await Barangay.create({
        authorized,
        barangayInfo
    });

    if (barangay) {
        return barangay.populate({
            path: 'authorized',
            select: '_id image name email phoneNumber sex position role isActive createdAt'
        })
    } else {
        throw new ApolloError('Invalid data format');
    }
});

// @desc    Setup barangay officials
// @access  Private
const setupBarangayOfficial = asyncHandler(async (args) => {
    const { barangay_id, barangayOfficials } = args;
    const barangay = await Barangay.findById(barangay_id);

    barangay.barangayOfficials = barangayOfficials || barangay.barangayOfficials

    barangay.save()

    if (barangay) return barangay.populate({
        path: 'authorized',
        select: '_id image name email phoneNumber sex position role isActive createdAt'
    })
    else throw new ApolloError('Invalid data format');
});

// @desc    Setup barangay images and map
// @access  Private
const setupBarangayImages = asyncHandler(async (args) => {
    const { barangay_id, images } = args;

    const barangay = await Barangay.findById(barangay_id)

    if (!barangay) throw new ApolloError('Barangay not found')

    barangay.images = images || barangay.images
    barangay.save()

    if (barangay)
        return barangay.populate({
            path: 'authorized',
            select: '_id image name email phoneNumber sex position role isActive createdAt'
        })
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

        return updated_barangay.populate({
            path: 'authorized',
            select: '_id image name email phoneNumber sex position role isActive createdAt'
        })
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
    const authorized = await Authorized.findOne({role: "Admin"})
    if(!authorized) throw new ApolloError("Admin not found");
    const barangay = await Barangay.findOne({ authorized: authorized })

    if (barangay) {
        return barangay.populate({
            path: 'authorized',
            select: '_id image name email phoneNumber sex position role isActive createdAt'
        })

    } else {
        throw new ApolloError('Barangay not found');
    }
});

// @desc    Get all barangay 
// @access  Private && Admin
const getAllBarangay = asyncHandler(async () => {
    const barangays = await Barangay.find()
    return barangays.populate({
        path: 'authorized',
        select: '_id image name email phoneNumber sex position role isActive createdAt'
    })
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
