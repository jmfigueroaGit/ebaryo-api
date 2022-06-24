const Barangay = require('../models/barangay_model');
const Admin = require('../models/admin_model');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')

// @desc    Setup barangay Information
// @access  Private
const setupBarangayInfo = asyncHandler(async (args) => {
    const { barangayInfo, admin } = args;
   
    const adminExist = await Admin.findById(admin)
    if(!adminExist) throw new ApolloError('Admin not found');
    const barangays = await Barangay.findOne({authorized: admin._id})

    if(barangays) throw new ApolloError('Admin already created barangay information');

    const barangay = await Barangay.create({
        admin,
        barangayInfo
    });

    if (barangay) {
        return barangay.populate({
            path: 'admin',
            select: '_id hasNewNotif image name email phoneNumber sex position role isActive createdAt'
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
        path: 'admin',
        select: '_id hasNewNotif image name email phoneNumber sex position role isActive createdAt'
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
            path: 'admin',
            select: '_id hasNewNotif image name email phoneNumber sex position role isActive createdAt'
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
            path: 'admin',
            select: '_id hasNewNotif image name email phoneNumber sex position role isActive createdAt'
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
    const admin = await Admin.findOne({role: "Admin"})
    if(!admin) throw new ApolloError("Admin not found");
    const barangay = await Barangay.findOne({ authorized: authorized })

    if (barangay) {
        return barangay.populate({
            path: 'admin',
            select: '_id hasNewNotif image name email phoneNumber sex position role isActive createdAt'
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
        path: 'admin',
        select: '_id hasNewNotif image name email phoneNumber sex position role isActive createdAt'
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
