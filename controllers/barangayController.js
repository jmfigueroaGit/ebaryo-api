const Barangay = require('../models/barangayModel');
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
    const { barangayInfo } = args;
    const barangay = await Barangay.create({
        barangayInfo
    });

    if (barangay) {
        return barangay
    } else {
        throw new ApolloError('Invalid data format');
    }
    return null
});

// @desc    Setup barangay officials
// @access  Private
const setupBarangayOfficial = asyncHandler(async (args) => {
    const { barangay_id, barangayOfficials } = args;
    const barangay = await Barangay.findById(barangay_id);

    barangay.barangayOfficials = barangayOfficials || barangay.barangayOfficials

    barangay.save()

    if (barangay) return barangay
    else throw new ApolloError('Invalid data format');
});

// @desc    Setup barangay images and map
// @access  Private
const setupBarangayImages = asyncHandler(async (args) => {
    const { barangay_id, image } = args;

    let images = []
    for (let i = 0; i < image.length; i++) {
        const { createReadStream } = await image[i]
        const stream = createReadStream()
        const cloudinaryUpload = async ({ stream }) => {
            try {
                await new Promise((resolve, reject) => {
                    const streamLoad = cloudinary.v2.uploader.upload_stream({ folder: "ebaryo/barangay" }, function (error, result) {
                        if (result) {
                            let data = {
                                public_id: result.public_id,
                                url: result.secure_url
                            }
                            images.push(data)
                            resolve({ data })
                        } else {
                            reject(error);
                        }
                    });
                    stream.pipe(streamLoad);
                });
            }
            catch (err) {
                throw new Error(`Failed to upload profile picture ! Err:${err.message}`);
            }
        };
        await cloudinaryUpload({ stream });
    }
    const barangay = await Barangay.findById(barangay_id)

    if (!barangay) throw new ApolloError('Barangay not found')

    barangay.images = images || barangay.images
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
    setupBarangayInfo,
    setupBarangayOfficial,
    setupBarangayImages,
    updateBarangay,
    deleteBarangay,
    getBarangayById,
    getAllBarangay
};
