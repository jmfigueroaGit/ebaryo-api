const announcementController = require('../controllers/announcementController')
module.exports = {
    Query: {
        announcements: () => {
            return announcementController.getAllAnnouncements()
        },
        announcement: (_, args) => {
            return announcementController.getAnnouncement(args)
        },
    },
    Mutation: {
        create_announcement: (_, args) => {
            return announcementController.createAnnouncement(args)
        },
        update_announcement: (_, args) => {
            return announcementController.updateAnnouncement(args)
        },
        delete_announcement: (_, args) => {
            return announcementController.deleteAnnouncement(args)
        }
    }
}