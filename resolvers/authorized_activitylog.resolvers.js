const authorizedLogController = require('../controllers/authorized_log_controller')

module.exports = {
    Query: {
        authorized_activities: () => {
            return authorizedLogController.getActivityLogs()
        },
        authorized_activity: (_, args) => {
            return authorizedLogController.getActivityLogById(args)
        },
    },
}