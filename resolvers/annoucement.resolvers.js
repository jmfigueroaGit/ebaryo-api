const announcementController = require('../controllers/announcementController')
module.exports = {
    Query: {
        announcements: () => {
            return announcementController.getAllAnnouncements()
        },
        announcement: (_, args) => {
            return announcementController.getAnnouncement(args)
        },
        announcement_filter: (_, args) => {
            return announcementController.filterAnnouncement(args)
        }
    },
    Mutation: {
        announcement_create: (_, args) => {
            return announcementController.createAnnouncement(args)
        },
        announcement_update: (_, args) => {
            return announcementController.updateAnnouncement(args)
        },
        announcement_delete: (_, args) => {
            return announcementController.deleteAnnouncement(args)
        }
    }
}