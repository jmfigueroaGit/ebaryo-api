const Announcement = require('../models/announcementModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const Authorized = require('../models/authorizedModel')
const leadingzero = require('leadingzero')
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// @desc    Create barangay announcement
// @access  Private || Admin
const createAnnouncement = asyncHandler(async (args) => {
    const { subject, description, user_id, image, postedUntil, publish } = args;

    const user = Authorized.findById(user_id)
    if (!user) throw new ApolloError('User not found')

    let imageUpload = null
    const { createReadStream } = await image
    const stream = createReadStream()

    const cloudinaryUpload = async ({ stream }) => {
        try {
            await new Promise((resolve, reject) => {
                const streamLoad = cloudinary.v2.uploader.upload_stream({ folder: "ebaryo/announcement" }, function (error, result) {
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
            throw new Error(`Failed to upload annoucement photo. Error :${err.message}`);
        }
    };
    await cloudinaryUpload({ stream });
    const annouceLength = await Announcement.find()
    const running = leadingzero(annouceLength.length + 1, 4)
    const ancmtId = 'ancmt-22-' + running;
    const announcement = await Announcement.create({
        subject,
        authorized: user_id,
        image: imageUpload,
        description,
        postedUntil,
        publish,
        ancmtId
    });

    if (announcement){ 
        
        return announcement.populate({
            path: 'authorized',
            select: '_id name email phoneNumber sex position role isActive'})
    }
    else throw new ApolloError('Invalid data format');
});

// @desc    Update barangay announcement
// @access  Private || Admin
const updateAnnouncement = asyncHandler(async (args) => {
    const announcement = await Announcement.findById(args.announce_id)

    if (announcement.publish === true) throw new ApolloError('Announcement cannot be updated once it is published')

    if (announcement) {
        announcement.description = args.description || announcement.description
        announcement.image = args.image || announcement.image
        announcement.postedUntil = args.postedUntil || announcement.postedUntil
        announcement.publish = args.publish || announcement.publish

        const updated_announcement = await announcement.save()
        return updated_announcement.populate({
            path: 'authorized',
            select: '_id name email phoneNumber sex position role isActive'
        })
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
    const announcement = await Announcement.findById(args.id).populate({
        path: 'authorized',
        select: '_id name email phoneNumber sex position role isActive'
    })

    if (!announcement) throw new ApolloError('Announcement not found');
    else return announcement

});

// @desc    GET All barangay Announcement
// @access  Private
const getAllAnnouncements = asyncHandler(async () => {
    const announcements = await Announcement.find().populate({
        path: 'authorized',
        select: '_id name email phoneNumber sex position role isActive'
    })

    return announcements
});

// @desc    Filter annoucement
// @access  Private
const filterAnnouncement = asyncHandler(async (args) => {
    const { value } = args
    const announcements = await Announcement.find({
        "$or": [
            { subject: { $regex: value } },
            { ancmtId: { $regex: value } },
            { description: { $regex: value } },
        ]
    }).populate({
        path: 'authorized',
        select: '_id name email phoneNumber sex position role isActive'
    })

    return announcements

})

module.exports = {
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncement,
    getAllAnnouncements,
    filterAnnouncement
};
