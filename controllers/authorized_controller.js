const asyncHandler = require('express-async-handler')
const { ApolloError } = require('apollo-server')
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')

const Authorized = require('../models/authorized_model')
const Authorizedlog = require('../models/authorized_log_model')
const AuthorizedNotification = require('../models/authorized_notification_model')
const Barangay = require('../models/barangay_model')

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
    const personnel = await Authorized.findOne({ email }).select('+password').populate('barangay')

    if (personnel && (await personnel.comparePassword(password))) {
        if(personnel.isActive){
            return { personnel, token: generateToken(personnel._id) }
        }
        else throw new ApolloError("Account is deactivated")
    }
    else
        throw new ApolloError("Invalid email or password")
})

// @desc    Change account status
// @access  Private 
const updateStatusPersonnel = asyncHandler(async (args) => {
    const personnel = await Authorized.findById(args.id)
   
    if (personnel) {
        personnel.isActive = args.isActive;
        const updated_personnel = await personnel.save();
        return updated_personnel
    }
    else
        throw new ApolloError("Personnel not found with this id")
})

// @desc    signup user
// @access  Private 
const createPersonnel = asyncHandler(async (args) => {
    const { first, middle, last, extension, email, password, phoneNumber, sex, position, imageUrl, publicId, barangayId, role } = args

    const barangay = await Barangay.findById(barangayId)

    //if(!barangay) throw new ApolloError("Barangay not found with this Id")

    const emailExist = await Authorized.findOne({ email })
    const phoneNumberExist = await Authorized.findOne({ phoneNumber })

    if (emailExist) throw new ApolloError("Email is already used")
    if (phoneNumberExist) throw new ApolloError("Phone number is already used.")
    const personnel = await Authorized.create({
        barangay: barangayId,
        name: {
            first,
            middle,
            last,
            extension
        },
        email, 
        password, 
        phoneNumber, 
        sex, 
        role,
        position,
        image: {
            public_id: publicId,
            url: imageUrl
        }
    })

    if (personnel){ 
        await Authorizedlog.create({ authorized: personnel._id })
        await AuthorizedNotification.create({ authorized: personnel._id })
        return personnel.populate('barangay')
    }
    else throw new ApolloError("Invalid user data")
})

// @desc    update user
// @access  Private 
const updatePersonnel = asyncHandler(async (args) => {
    const personnel = await Authorized.findById(args.id)
    if (personnel) {
        personnel.image.url = args.imageUrl || personnel.image.url
        personnel.image.public_id = args.publicId || personnel.image.public_id
        personnel.name.first = args.first || personnel.name.first
        personnel.name.middle = args.middle || personnel.name.middle
        personnel.name.last = args.last || personnel.name.last
        personnel.name.extension = args.extension || personnel.name.extension
        personnel.email = args.email || personnel.email
        personnel.phoneNumber = args.phoneNumber || personnel.phoneNumber
        personnel.sex = args.sex || personnel.sex
        personnel.position = args.position || personnel.position
        if (args.password) {
            personnel.password = args.password;
        }
        const updated_personnel = await personnel.save();
        return updated_personnel.populate({
            path: 'barangay'})
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
        return personnel.populate('barangay')
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
    resetPersonnelPassword,
    updateStatusPersonnel
}