const asyncHandler = require('express-async-handler')
const { ApolloError } = require('apollo-server')
const jwt = require("jsonwebtoken")
const crypto = require('crypto')

const Admin = require('../models/admin_model')

const generateToken = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')

// @desc    Get All Admin
// @access  Private || Admin
const getAllAdmin = asyncHandler(async () => {
     const admins = await Admin.find()
     return admins
})

// @desc    Get Admin by ID
// @access  Private || Admin
const getAdminById = asyncHandler(async (args) => {
    const admin = await Admin.findById(args.id)
    if(admin) return admin
    else throw new ApolloError('Admin not found with this ID')
})

// @desc   Login Admin
// @access  Private || Admin
const authAdmin = asyncHandler(async (args) => {
    const { email, password } = args
    const admin = await Admin.findOne({ email }).select("+password")

    if(admin && (await admin.comparePassword(password))){
        if(admin.isActive){
            return {
                admin,
                token: generateToken(admin._id)
            }
        }
    } else {
        throw new ApolloError("Invalid email or password")
    }
})
 
// @desc   Register Admin
// @access  Private || Admin
const createAdmin = asyncHandler(async (args) => {
    const { first, middle, last, extension, email, password, phoneNumber, sex, position, imageUrl, publicId } = args

    const emailExist = await Admin.findOne({ email })

    if(email) throw new ApolloError("Email is already used")

    const admin = await Admin.create({
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
        position, 
        image: {
            public_id: publicId,
            url: imageUrl
        }
    })

    if(admin){
        return admin
    } else {
        throw new ApolloError("Invalid user data")
    }
})

// @desc   Update Admin 
// @access  Private || Admin
const updateAdmin = asyncHandler(async (args) => {
    const admin = await Admin.findById(args.id)
    if (admin) {
        admin.image.url = args.imageUrl || admin.image.url
        admin.image.public_id = args.publicId || admin.image.public_id
        admin.name.first = args.first || admin.name.first
        admin.name.middle = args.middle || admin.name.middle
        admin.name.last = args.last || admin.name.last
        admin.name.extension = args.extension || admin.name.extension
        admin.email = args.email || admin.email
        admin.phoneNumber = args.phoneNumber || admin.phoneNumber
        admin.sex = args.sex || admin.sex
        admin.position = args.position || admin.position
        if (args.password) {
            admin.password = args.password;
        }
        const updated_admin = await admin.save();
        return updated_admin
    }
    else
        throw new ApolloError("Admin not found with this id")
})

// @desc   Authorized Admin token 
// @access  Private || Admin
const authAdminToken = asyncHandler(async (args) => {
    const { token } = args
    const { id } = jwt.verify(token, process.env.JWT_SECRET)
    const admin = Admin.findById(id)
    if(admin) return admin
})

// @desc   Verify Admin Email
// @access  Private || Admin
const verifyEmailAdmin = asyncHandler(async (args) => {
    const { email } = args
    const admin = await Admin.findOne({ email })

    if (!admin) {
        throw new ApolloError('Admin not found with this email')
    }

    // Generate reset token
    const resetToken = admin.getResetPasswordToken()

    await admin.save({ validateBeforeSave: true })

    const message = `Your password reset token: ${resetToken}`

    try {
        await sendEmail({
            email: admin.email,
            subject: 'E-baryo Password Recovery',
            message,
        });

        return { success: true, message: `Email sent to: ${admin.email}` }
    } catch (error) {
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpire = undefined;

        await admin.save({ validateBeforeSave: false });
        throw new ApolloError(error.message);
    }
})

// @desc   Reset Admin Password
// @access  Private || Admin
const resetPersonnelPassword = asyncHandler(async (args) => {
    // Hash URL Token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(args.token)
        .digest('hex');

    const admin = await Admin.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!admin) {
        throw new ApolloError('Password reset token is invalid or has been expired');
    }

    if (args.password !== args.confirmPassword) {
        throw new ApolloError('Password does not match')
    }

    // Setup the new password
    admin.password = args.password;

    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save();

    return { success: true, message: 'Password Updated Successfully' }
});

module.exports = {
    getAllAdmin,
    getAdminById,
    authAdmin,
    createAdmin,
    updateAdmin,
    authAdminToken,
    verifyEmailAdmin,
    resetPersonnelPassword
}