const Resident = require('../models/residentModel')
const User = require('../models/userModel')
const userNotification = require('../models/userNotificationModel')
const ActivityLog = require('../models/activitylogModel')
const asyncHandler = require('express-async-handler')
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')
const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// @desc    Get All Residents
// @access  Private || Admin
const getAllResidents = asyncHandler(async () => {
    const residents = await Resident.find().populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })
    return residents
});

// @desc    Get All Residents
// @access  Private || Admin
const getFilterResidents = asyncHandler(async (args) => {
    const value = args.value.toLowerCase()
    const residents = await Resident.find({
        "$or": [
            { sex: { $regex: value } },
            { residentId: { $regex: value } },
            { nationality: { $regex: value } },
            { mobileNumber: { $regex: value } },
            { email: { $regex: value } },
        ]
    }).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })
    return residents
});

// @desc    Get single resident
// @access  Private 
const getResident = asyncHandler(async (id) => {
    const resident = await Resident.findById(id).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })
    if (resident) return resident
    else throw new ApolloError('Resident not existed with this ID');
});

// @desc    Get single by user's id
// @access  Private
const getResidentById = asyncHandler(async (user_id) => {
    const resident = await Resident.findOne({ user: user_id }).populate({
        path: 'user',
        select: '_id email isVerified hasNewNotif image'
    })
    if (resident) return resident
    else throw new ApolloError(`Resident not existed with this User's ID`);
})

// @desc    Create resident
// @access  Private 
const createResident = asyncHandler(async (args) => {

    // Mapping values from argument
    const { first, middle, last, sex, birthday, nationality, mobileNumber, email, houseNumber, street, barangay, province, city, zipcode, photo } = args;
    const { createReadStream } = await photo

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

    // Upload image to cloudinary
    const stream = createReadStream()
    let imageUpload = null
    const cloudinaryUpload = async ({ stream }) => {
        try {
            await new Promise((resolve, reject) => {
                const streamLoad = cloudinary.v2.uploader.upload_stream({ folder: "ebaryo/users" },function (error, result) {
                    if (result) {
                        imageUpload = {
                            public_id: result.public_id,
                            url: result.secure_url
                        }
                        resolve({ imageUpload })
                    } else {
                        reject(error);
                    }
                });
                stream.pipe(streamLoad);
            });
        }
        catch (err) {
            throw new ApolloError(`Failed to upload profile picture ! Err:${err.message}`);
        }
    };
    await cloudinaryUpload({ stream });

    // Create user account using email and auto-generated password
    const user = await User.create({
        email,
        password: generateToken(email),
        image: imageUpload
    })

    // Check if user account is created
    if (!user) {
        throw new ApolloError('User not existed');
    }

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
        address: { houseNumber, street, barangay, province, city, zipcode },
        residentId
    })


    if (resident) {
        await userNotification.create({ user: user._id })
        await ActivityLog.create({ user: user._id })
        return resident.populate({
            path: 'user',
            select: '_id email isVerified hasNewNotif image'
        });
    } else {
        throw new ApolloError('Invalid user data');
    }
})

// @desc    Update Residents info
// @access  Private || Admin
const updateResident = asyncHandler(async (args) => {
    const resident = await Resident.findOne({ user: args.user_id })

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
        resident.address.houseNumber = args.houseNumber || resident.address.houseNumber
        resident.address.street = args.street || resident.address.street
        resident.address.barangay = args.barangay || resident.address.barangay
        resident.address.province = args.province || resident.address.province
        resident.address.city = args.city || resident.address.city
        resident.address.zipcode = args.zipcode || resident.address.zipcode

        // Upload image to cloudinary
        const { createReadStream } = await args.photo
        console.log(createReadStream);
        // const stream = createReadStream()
        // let imageUpload = null
        // const cloudinaryUpload = async ({ stream }) => {
        //     try {
        //         await new Promise((resolve, reject) => {
        //             const streamLoad = cloudinary.v2.uploader.upload_stream({ folder: "ebaryo/users" },function (error, result) {
        //                 if (result) {
        //                     imageUpload = {
        //                         public_id: result.public_id,
        //                         url: result.secure_url
        //                     }
        //                     resolve({ imageUpload })
        //                 } else {
        //                     reject(error);
        //                 }
        //             });
        //             stream.pipe(streamLoad);
        //         });
        //     }
        //     catch (err) {
        //         throw new ApolloError(`Failed to upload profile picture ! Err:${err.message}`);
        //     }
        // };
        // await cloudinaryUpload({ stream });



        const updateResident = await resident.save()

        return updateResident
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