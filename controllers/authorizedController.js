const asyncHandler = require('express-async-handler')
const { ApolloError } = require('apollo-server')
const jwt = require("jsonwebtoken");
const Authorized = require('../models/authorizedModel')
const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto');

// @desc    Get All Users
// @access  Private || Admin
const getAllPersonnels = asyncHandler(async () => {
    const personnels = await Authorized.find()
    return personnels
});

// @desc    Get User by Id
// @access  Private 
const getPersonnelById = asyncHandler(async (args) => {
    const personnel = await Authorized.findById(args.id)
    if (personnel)
        return personnel
    else
        throw new ApolloError("Personnel not found with this id")
})

// @desc    login user
// @access  Public 
const authPersonnel = asyncHandler(async (args) => {
    const { email, password } = args
    const personnel = await Authorized.findOne({ email }).select('+password')

    if (personnel && (await personnel.comparePassword(password))) {
        return { personnel, token: generateToken(personnel._id) }
    }
    else
        throw new ApolloError("Invalid email or password")
})

// @desc    signup user
// @access  Public 
const createPersonnel = asyncHandler(async (args) => {
    const { name, email, password, phoneNumber, sex, position, role } = args
    const emailExist = await Authorized.findOne({ email })

    if (emailExist) throw new ApolloError("Email is already used")

    const personnel = await Authorized.create({ name, email, password, phoneNumber, sex, position, role })

    if (personnel) return { personnel, token: generateToken(personnel._id) }
    else throw new ApolloError("Invalid user data")
})

// @desc    update user
// @access  Private 
const updatePersonnel = asyncHandler(async (args) => {
    const personnel = await Authorized.findById(args.id)
    if (personnel) {
        personnel.name = args.name || personnel.name
        personnel.email = args.email || personnel.email
        personnel.phoneNumber = args.phoneNumber || personnel.phoneNumber
        personnel.sex = args.sex || personnel.sex
        personnel.position = args.position || personnel.position
        personnel.role = args.role || personnel.role
        if (args.password) {
            personnel.password = args.password;
        }
        const updated_personnel = await personnel.save();
        return updated_personnel
    }
    else
        throw new ApolloError("Personnel not found with this id")
})

// @desc    authenticate token
// @access  Private
const authPersonnelToken = asyncHandler(async (token) => {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const personnel = Authorized.findById(id)
    if (personnel)
        return personnel
})


// @desc    delete user 
// @access  Private | Admin
const deletePersonnel = asyncHandler(async (args) => {
    const personnel = await Authorized.findById(args.id)

    if (personnel) {
        await personnel.remove()
        return { message: "Personnel removed" }
    }
    else throw new ApolloError("Personnel not found")
})

const verifyEmailPersonnel = asyncHandler(async (args) => {
    const personnel = await Authorized.findOne({ email: args.email })

    if (!personnel) {
        throw new ApolloError('Personnel not found with this email')
    }

    // Generate reset token
    const resetToken = personnel.getResetPasswordToken()

    await personnel.save({ validateBeforeSave: true })

    const message = `Your password reset token: ${resetToken}`

    try {
        await sendEmail({
            email: personnel.email,
            subject: 'E-baryo Password Recovery',
            message,
        });

        return { success: true, message: `Email sent to: ${personnel.email}` }
    } catch (error) {
        personnel.resetPasswordToken = undefined;
        personnel.resetPasswordExpire = undefined;

        await personnel.save({ validateBeforeSave: false });
        throw new ApolloError(error.message);
    }
})

const resetPersonnelPassword = asyncHandler(async (args) => {
    // Hash URL Token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(args.token)
        .digest('hex');

    const personnel = await Authorized.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!personnel) {
        throw new ApolloError('Password reset token is invalid or has been expired');
    }

    if (args.password !== args.confirmPassword) {
        throw new ApolloError('Password does not match')
    }

    // Setup the new password
    personnel.password = args.password;

    personnel.resetPasswordToken = undefined;
    personnel.resetPasswordExpire = undefined;

    await personnel.save();

    return { success: true, message: 'Password Updated Successfully' }
});

module.exports = {
    getAllPersonnels,
    getPersonnelById,
    authPersonnel,
    createPersonnel,
    updatePersonnel,
    authPersonnelToken,
    deletePersonnel,
    verifyEmailPersonnel,
    resetPersonnelPassword
}