const asyncHandler = require('express-async-handler')
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')

const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')

const Resident = require('../models/resident_model')
const User = require('../models/user_model')
const userNotification = require('../models/user_notification_model')
const ActivityLog = require('../models/user_log_model')
const Barangay = require('../models/barangay_model')

// @desc    Get All Residents
// @access  Private || Admin
const getAllResidents = asyncHandler(async () => {
    const residents = await Resident.find().populate({
        path: 'user',
        populate: {
            path: "barangay"
        }
    })
    return residents
});

// @desc    Get All Residents
// @access  Private || Admin
const getFilterResidents = asyncHandler(async (args) => {
    const value = args.value.toLowerCase()
    const residents = await Resident.find({
        "$or": [
            { 'name.first': { $regex: value } },
            { 'name.last': { $regex: value } },
            { sex: { $regex: value } },
            { residentId: { $regex: value } },
            { nationality: { $regex: value } },
            { mobileNumber: { $regex: value } },
            { email: { $regex: value } },
        ]
    }).populate({
        path: 'user',
        populate: {
            path: "barangay"
        }
    })
    return residents
});

// @desc    Get single resident
// @access  Private 
const getResident = asyncHandler(async (id) => {
    const resident = await Resident.findById(id).populate({
        path: 'user',
        populate: { 
            path: 'barangay'
        }
    })
    if (resident) return resident
    else throw new ApolloError('Resident not existed with this ID');
});

// @desc    Get single by user's id
// @access  Private
const getResidentById = asyncHandler(async (user_id) => {
    const resident = await Resident.findOne({ user: user_id }).populate({
        path: 'user',
        populate: { 
            path: 'barangay'
        }
    })
    if (resident) return resident
    else throw new ApolloError(`Resident not existed with this User's ID`);
})

// @desc    Create resident
// @access  Private 
const createResident = asyncHandler(async (args) => {

    // Mapping values from argument
    const { first, middle, last, sex, birthday, nationality, mobileNumber, email, houseNumber, street, barangay, province, city, zipcode, imageUrl, publicId, barangayId, residencyLength } = args;

    const barangayExist = await Barangay.findById(barangayId)

    if(!barangayExist) throw new ApolloError('Barangay not found with this id')

    // Find phone number in the Resident's database
    const phoneExists = await Resident.findOne({ mobileNumber });

    // Check phone number if already existed 
    if (phoneExists) {
        throw new ApolloError('Phone number is already used');
    }

    // Find email address in the Resident's database
    const emailExists = await Resident.findOne({ email });

    // Check email address if already existed 
    if (emailExists) {
        throw new ApolloError('Email address is already used');
    }

    // Create user account using email and auto-generated password
    const user = await User.create({
        name: first + " " + middle + " " + last,
        email,
        barangay: barangayId,
        password: generateToken(email),
        image: {
            public_id: publicId,
            url:imageUrl
        }
    })

    // Generate reset token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: true })

    const message = resetToken

    try {
        await sendEmail({
            email: user.email,
            subject: 'E-baryo Account Verification',
            message,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApolloError(error.message);
    }

    const residentLength = await Resident.find()
    const running = leadingzero(residentLength.length + 1, 4)
    const residentId = 'rsdt-22-' + running;

    const resident = await Resident.create({
        user: user._id,
        name: { first, middle, last },
        sex,
        birthday,
        nationality,
        mobileNumber,
        email,
        residencyLength,
        address: { houseNumber, street, barangay, province, city, zipcode },
        residentId
    })


    if (resident) {
        await userNotification.create({ user: user._id })
        await ActivityLog.create({ user: user._id })
        return resident.populate({
            path: 'user',
            populate: { 
                path: 'barangay'
            }
        })
    } else {
        throw new ApolloError('Invalid user data');
    }
})

// @desc    Update Residents info
// @access  Private || Admin
const updateResident = asyncHandler(async (args) => {
    const resident = await Resident.findOne({ user: args.user_id })
    const user = await User.findById(args.user_id)

    if (resident) {
        resident.name.first = args.first || resident.name.first
        resident.name.middle = args.middle || resident.name.middle
        resident.name.last = args.last || resident.name.last
        resident.name.extension = args.extension || resident.name.extension
        resident.sex = args.sex || resident.sex
        resident.birthday = args.birthday || resident.birthday
        resident.nationality = args.nationality || resident.nationality
        resident.mobileNumber = args.mobileNumber || resident.mobileNumber
        resident.email = args.email || resident.email
        resident.residencyLength = args.residencyLength || resident.residencyLength
        resident.address.houseNumber = args.houseNumber || resident.address.houseNumber
        resident.address.street = args.street || resident.address.street
        resident.address.barangay = args.barangay || resident.address.barangay
        resident.address.province = args.province || resident.address.province
        resident.address.city = args.city || resident.address.city
        resident.address.zipcode = args.zipcode || resident.address.zipcode
        if(user){
            user.name = args.first + " " + args.middle + " " + args.last || user.name
            user.email = args.email || user.email
            user.image.url = args.imageUrl || user.image.url
            user.image.public_id = args.publicId || user.image.public_id
            await user.save()
        }

        const updateResident = await resident.save()

        return updateResident.populate({
            path: 'user',
            populate: { 
                path: 'barangay'
            }
        })
    } else {
        throw new ApolloError('Resident not existed with this ID');
    }

});

// @desc    Delete Resident
// @access  Private || Admin
const deleteResident = asyncHandler(async (args) => {
    const resident = await Resident.findById(args.id);
    if (resident) {
        await resident.remove();
        const message = 'Resident removed'
        return { message }
    } else {
        throw new ApolloError('Resident not found');
    }
});

module.exports = {
    getAllResidents,
    getFilterResidents,
    getResident,
    getResidentById,
    createResident,
    updateResident,
    deleteResident
}