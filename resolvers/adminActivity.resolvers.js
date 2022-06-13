const adminNotificationController = require('../controllers/adminNotificationController')

module.exports = {
    Query: {
        notification_admin: (_, args) => {
            return adminNotificationController.getNotificationById(args)
        },
        activity_admins: () => {
            return adminNotificationController.getActivityLogs()
        },
        activity_admin: (_, args) => {
            return adminNotificationController.getActivityLogById(args)
        },
    },
}