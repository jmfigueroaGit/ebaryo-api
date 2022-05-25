const Announcement = require('../models/announcementModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const User = require('../models/userModel')
const leadingzero = require('leadingzero')

// @desc    Create barangay announcement
// @access  Private || Admin
const createAnnouncement = asyncHandler(async (args) => {
    const { description, user_id, image, postedUntil, publish } = args;

    const user = User.findById(user_id)

    if (!user) {
        throw new ApolloError('User not found')
    }
    const annouceLength = await Announcement.find()
    const running = leadingzero(annouceLength.length + 1, 4)
    const ancmtId = 'ancmt-22-' + running;
    const announcement = await Announcement.create({
        user: user_id,
        image: image,
        description,
        postedUntil,
        publish,
        ancmtId
    });

    if (announcement) return announcement
    else throw new ApolloError('Invalid data format');
});

// @desc    Update barangay announcement
// @access  Private || Admin
const updateAnnouncement = asyncHandler(async (args) => {
    const announcement = await Announcement.findById(args.announce_id)

    if (announcement) {
        announcement.description = args.description || announcement.description
        announcement.image = args.image || announcement.image
        announcement.postedUntil = args.postedUntil || announcement.postedUntil
        announcement.publish = args.publish || announcement.publish

        const updated_announcement = await announcement.save()
        return updated_announcement
    }
    else throw new Error('Announcement not found');

});

// @desc    Delete barangay annoucement
// @access  Private || Admin
const deleteAnnouncement = asyncHandler(async (args) => {
    const announcement = await Announcement.findById(args.announce_id);

    if (announcement) {
        await announcement.remove();
        return { message: 'Announcement removed', }
    } else
        throw new ApolloError('Announcement not found');

});

// @desc    GET barangay Announcement
// @access  Private
const getAnnouncement = asyncHandler(async (args) => {
    const announcement = await Announcement.findById(args.id);

    if (!announcement) throw new ApolloError('Announcement not found');
    else return announcement

});

// @desc    GET All barangay Announcement
// @access  Private
const getAllAnnouncements = asyncHandler(async () => {
    const announcements = await Announcement.find();

    return announcements
});

module.exports = {
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncement,
    getAllAnnouncements,
};
