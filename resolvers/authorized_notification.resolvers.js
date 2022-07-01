const authorizedNotificationController = require('../controllers/authorized_notification_controller')

module.exports = {
    Query: {
        authorized_notification: (_, args) => {
            return authorizedNotificationController.getNotificationById(args)
        },
    },
}