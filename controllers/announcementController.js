const Announcement = require('../models/announcementModel');
const User = require('../models/userModel')
const userNotification = require('../models/userNotificationModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const Authorized = require('../models/authorizedModel')
const leadingzero = require('leadingzero')
const moment = require('moment')

// @desc    Create barangay announcement
// @access  Private || Admin
const createAnnouncement = asyncHandler(async (args) => {
    const { subject, description, user_id, imageUrl, publicId, postedUntil, publish } = args;

    const user = Authorized.findById(user_id)
    if (!user) throw new ApolloError('User not found')

    const annouceLength = await Announcement.find()
    const running = leadingzero(annouceLength.length + 1, 4)
    const ancmtId = 'ancmt-22-' + running;
    const announcement = await Announcement.create({
        subject,
        authorized: user_id,
        image: {
            public_id: publicId,
            url: imageUrl
        },
        description,
        postedUntil,
        publish,
        ancmtId
    });

    if (announcement){ 
        if(announcement.publish === true){
            const user = await User.updateMany({}, { $set: { hasNewNotif: true } });

            const data = {
                type: "announcement",
                description: `${announcement.subject} is now available. Check it.`,
                notifId: announcement._id
            }

            const notification = await userNotification.find();

            for (let i = 0; i < notification.length; i++) {
                notification[i].notifications.push(data)
                notification[i].save()
            }
    
            if (user && notification){
                return announcement.populate({
                    path: 'authorized',
                    select: '_id image name email phoneNumber sex position role isActive createdAt'})
            }
            else throw new ApolloError('Error encountered');
        }
        else return announcement

    }
    else throw new ApolloError('Invalid data format');
});

// @desc    Update barangay announcement
// @access  Private || Admin
const updateAnnouncement = asyncHandler(async (args) => {
    const announcement = await Announcement.findById(args.announce_id)

    if (announcement.publish === true) throw new ApolloError('Announcement cannot be updated once it is published')

    if (announcement) {
        announcement.subject = args.subject || announcement.subject
        announcement.description = args.description || announcement.description
        announcement.image.public_id = args.publicId || announcement.image.public_id
        announcement.image.url = args.imageUrl || announcement.image.url
        announcement.postedUntil = args.postedUntil || announcement.postedUntil
        announcement.publish = args.publish || announcement.publish

        const updated_announcement = await announcement.save()
        return updated_announcement.populate({
            path: 'authorized',
            select: '_id image name email phoneNumber sex position role isActive'
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
        select: '_id image name email phoneNumber sex position role isActive'
    })

    if (!announcement) throw new ApolloError('Announcement not found');
    else return announcement

});

// @desc    GET All barangay Announcement
// @access  Private
const getAllAnnouncements = asyncHandler(async () => {
    
    const announcements = await Announcement.find().populate({
        path: 'authorized',
        select: '_id image name email phoneNumber sex position role isActive'
    })

    return announcements
});

// @desc    GET All barangay Announcement
// @access  Private
const getByDateAnnouncements = asyncHandler(async () => {
    
    const announcements = await Announcement.find().populate({
        path: 'authorized',
        select: '_id image name email phoneNumber sex position role isActive'
    })
    const filterByExpiration = () => {
        const Today = Date.now()
        return announcements.filter(function (item) {
          return new Date(item.postedUntil).getTime() > Today;
        });
    };

    return filterByExpiration()
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
        select: '_id image name email phoneNumber sex position role isActive'
    })

    return announcements

})

// @desc    Update barangay announcement
// @access  Private || Admin
const publishAnnouncement = asyncHandler(async (args) => {
    const { announcementId, status } = args

    const announcement = await Announcement.findById(announcementId)

    announcement.publish = status
    announcement.save()

    if(announcement.publish === true){
        const user = await User.updateMany({}, { $set: { hasNewNotif: true } });

        const data = {
            type: "announcement",
            description: `${announcement.subject} is now available. Check it.`,
            notifId: announcement._id
        }

        const notification = await userNotification.find();

        for (let i = 0; i < notification.length; i++) {
            notification[i].notifications.push(data)
            notification[i].save()
        }

        if (user && notification){
            return announcement.populate({
                path: 'authorized',
                select: '_id image name email phoneNumber sex position role isActive'})
        }
        else throw new ApolloError('Error encountered');
    }
    else return announcement.populate({
        path: 'authorized',
        select: '_id image name email phoneNumber sex position role isActive'
    })
})

module.exports = {
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncement,
    getAllAnnouncements,
    getByDateAnnouncements,
    filterAnnouncement,
    publishAnnouncement
};
