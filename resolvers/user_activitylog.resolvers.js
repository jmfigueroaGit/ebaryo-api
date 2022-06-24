const userNotificationController = require('../controllers/user_log_model')
module.exports = {
    Query: {
        activity_user: (_, args) => {
            return userNotificationController.getActivityLogById(args)
        },
    },
}