const reportController = require('../controllers/reportController')
module.exports = {
    Query: {
        reports: () => {
            return reportController.getAllReports()
        },
        report: (_, args) => {
            return reportController.getReportById(args)
        },
        report_user: (_, args) => {
            return reportController.getUserReports(args)
        }
    },
    Mutation: {
        create_report: (_, args) => {
            return reportController.createReport(args)
        },
        update_report: (_, args) => {
            return reportController.updateReport(args)
        },
        delete_report: (_, args) => {
            return reportController.deleteReport(args)
        }
    }
}