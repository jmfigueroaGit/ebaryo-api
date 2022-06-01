const userNotificationController = require('../controllers/userNotificationController')
module.exports = {
    Query: {
        activity_user: (_, args) => {
            return userNotificationController.getActivityLogById(args)
        },
    },
}