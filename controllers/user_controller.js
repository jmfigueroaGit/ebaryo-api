const asyncHandler = require('express-async-handler')
const { ApolloError } = require('apollo-server')
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const cloudinary = require('cloudinary')

const User = require('../models/user_model')
const Resident = require('../models/resident_model')

const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')


// @desc    Get All Users
// @access  Private || Admin
const getAllUsers = asyncHandler(async () => {
    const users = await User.find().populate({
        path: 'barangay',
        populate: {
            path: 'admin'
        } 
    })
    return users
});

// @desc    Get All Users
// @access  Private || Admin
const getFilterUsers = asyncHandler(async (args) => {
    const value = args.value.toLowerCase()

    const users = await User.find({
        "$or": [
            { 'email': { $regex: value } }
        ]
    })
    return users
});

// @desc    Get User by Id
// @access  Private 
const getUserById = asyncHandler(async (id) => {
    const user = await User.findById(id).populate({
        path: 'barangay',
        populate: {
            path: 'admin'
        } 
    })
    if (user)
        return user
    else
        throw new ApolloError("User not found with this id")
})

// @desc    login user
// @access  Public 
const authUser = asyncHandler(async (email, password) => {
    const user = await User.findOne({ email }).select('+password').populate({
        path: 'barangay',
        populate: {
            path: 'admin'
        } 
    })

    if (user && (await user.comparePassword(password))) {
        return { user, token: generateToken(user._id) }
    }
    else
        throw new ApolloError("Invalid email or password")
})

// @desc    update user
// @access  Private 
const updateUser = asyncHandler(async (args) => {
    const user = await User.findById(args.id)
    if (user) {
        user.email = args.email || user.email
        if (args.password) {
            user.password = args.password;
        }
        await user.save();
        return user.populate({
            path: 'barangay',
            populate: {
                path: 'admin'
            } 
        })
    }
    else
        throw new ApolloError("User not found with this id")
})

// @desc    authenticate token
// @access  Private
const authToken = asyncHandler(async (token) => {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = User.findById(id)
    if (user)
        return user.populate({
            path: 'barangay',
            populate: {
                path: 'admin'
            } 
        })
})

// @desc    delete user 
// @access  Private | Admin
const deleteUser = asyncHandler(async (id) => {
    const user = await User.findById(id)
    const resident = await Resident.findOne({ user: id })

    if (user) {
        await user.remove()
        if (resident)
            await resident.remove()

        return { message: "User removed" }
    }
    else throw new ApolloError("User not found")
})

const verifyEmail = asyncHandler(async (email) => {
    const user = await User.findOne({ email: email })

    if (!user) {
        throw new ApolloError('User not found with this email')
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: true })

    const message = resetToken

    try {
        await sendEmail({
            email: user.email,
            subject: 'E-baryo Password Recovery',
            message,
        });

        return { success: true, message: `Email sent to: ${user.email}` }
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        throw new ApolloError(error.message);
    }
})

const resetPassword = asyncHandler(async (args) => {
    // Hash URL Token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(args.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApolloError('Password reset token is invalid or has been expired');
    }

    if (args.password !== args.confirmPassword) {
        throw new ApolloError('Password does not match')
    }

    // Setup the new password
    user.password = args.password;
    user.isVerified = true
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return { success: true, message: 'Password Updated Successfully' }
});

const readNotification = asyncHandler(async (args) => {
    const user = await User.findById(args.id)
    user.hasNewNotif = false
    await user.save()
    return user.populate({
        path: 'barangay',
        populate: {
            path: 'admin'
        } 
    })
})

module.exports = {
    getAllUsers,
    getFilterUsers,
    getUserById,
    authUser,
    updateUser,
    authToken,
    deleteUser,
    verifyEmail,
    resetPassword,
    readNotification
}