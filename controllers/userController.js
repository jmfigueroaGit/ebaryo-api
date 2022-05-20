const User = require('../models/userModel')
const Resident = require('../models/residentModel')
const asyncHandler = require('express-async-handler')
const { ApolloError } = require('apollo-server')
const generateToken = require('../utils/generateToken')
const jwt = require("jsonwebtoken");

// @desc    Get All Users
// @access  Private || Admin
const getAllUsers = asyncHandler(async () => {
    const users = await User.find()
    return users
});

// @desc    Get User by Id
// @access  Private 
const getUserById = asyncHandler(async (id) => {
    const user = await User.findById(id)
    if (user)
        return user
    else
        throw new ApolloError("User not found with this id")
})

// @desc    login user
// @access  Public 
const authUser = asyncHandler(async (email, password) => {
    const user = await User.findOne({ email }).select('+password')

    if (user && (await user.comparePassword(password))) {
        return { user, token: generateToken(user._id) }
    }
    else
        throw new ApolloError("Invalid email or password")
})

// @desc    signup user
// @access  Public 
const signupUser = asyncHandler(async (email, password) => {
    const emailExist = await User.findOne({ email })

    if (emailExist) throw new ApolloError("Email is already used")

    const user = await User.create({ email, password })

    if (user) return { user, token: generateToken(user._id) }
    else throw new ApolloError("Invalid user data")
})

// @desc    update user
// @access  Private 
const updateUser = asyncHandler(async (args) => {
    const user = await User.findById(args.id)
    if (user) {
        user.email = user.email || args.email
        if (args.password) {
            user.password = args.password;
        }
        await user.save();
        return user
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
        return user
})

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

module.exports = {
    getAllUsers,
    getUserById,
    authUser,
    signupUser,
    updateUser,
    authToken,
    deleteUser
}