const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')

const Announcement = require('../models/announcement_model');
const User = require('../models/user_model')
const userNotification = require('../models/user_notification_model');
const Authorized = require('../models/authorized_model')
const Authorizedlog = require('../models/authorized_log_model') 

// @desc    Create barangay announcement
// @access  Private || Admin
const createAnnouncement = asyncHandler(async (args) => {
    const { subject, description, authorizedId, imageUrl, publicId, postedUntil, publish } = args;

    const annouceLength = await Announcement.find()
    const running = leadingzero(annouceLength.length + 1, 4)
    const ancmtId = 'ancmt-22-' + running;

    const announcement = await Announcement.create({
        subject,
        image: {
            public_id: publicId,
            url: imageUrl
        },
        authorized: authorizedId,
        description,
        postedUntil,
        publish,
        ancmtId
    });


    if (announcement){ 
        const authorized = await Authorized.findById(authorizedId)
        if (authorized) {
            const activityLogs = await Authorizedlog.findOne({ authorized: authorizedId })
            const authorizedActivity = {
                type: "announcement",
                title: "Created an Announcement",
                description: `${announcement.subject} - ${announcement.ancmtId.toUpperCase()}`,
                activityId: announcement._id
            }
            activityLogs.activities.push(authorizedActivity)
            activityLogs.save()
        }    
        
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
                return announcement.populate('authorized')
            }
            else throw new ApolloError('Error encountered');
        }
        else return announcement.populate('authorized')

    }
    else throw new ApolloError('Invalid data format');
});

// @desc    Update barangay announcement
// @access  Private || Admin
const updateAnnouncement = asyncHandler(async (args) => {
    const announcement = await Announcement.findById(args.announceId)

    if (announcement.publish === true) throw new ApolloError('Announcement cannot be updated once it is published')

    if (announcement) {
        announcement.subject = args.subject || announcement.subject
        announcement.description = args.description || announcement.description
        announcement.image.public_id = args.publicId || announcement.image.public_id
        announcement.image.url = args.imageUrl || announcement.image.url
        announcement.postedUntil = args.postedUntil || announcement.postedUntil
        announcement.publish = args.publish || announcement.publish

        const updated_announcement = await announcement.save()
        return updated_announcement.populate('authorized')
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
    const announcement = await Announcement.findById(args.id).populate('authorized')

    if (!announcement) throw new ApolloError('Announcement not found');
    else return announcement
});

// @desc    GET All barangay Announcement
// @access  Private
const getAllAnnouncements = asyncHandler(async () => {   
    const announcements = await Announcement.find().populate('authorized')
    return announcements
});

// @desc    GET All barangay Announcement
// @access  Private
const getByDateAnnouncements = asyncHandler(async () => {
    
    const announcements = await Announcement.find().populate('authorized')
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
    }).populate('authorized')

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

        if (user && notification) return announcement.populate('authorized')
        else throw new ApolloError('Error encountered');
    }
    else return announcement
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
