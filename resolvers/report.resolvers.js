const reportController = require('../controllers/reportController')
module.exports = {
    Query: {
        reports: () => {
            return reportController.getAllReports()
        },
        reports_filter: (_, args) => {
            return reportController.getFilterReports(args)
        },
        report: (_, args) => {
            return reportController.getReportById(args)
        },
        report_user: (_, args) => {
            return reportController.getUserReports(args)
        },
        report_date: (_, args) => {
            return reportController.getAllReportsByDate(args)
        },
    },
    Mutation: {
        report_create: (_, args) => {
            return reportController.createReport(args)
        },
        report_update: (_, args) => {
            return reportController.updateReport(args)
        },
        report_delete: (_, args) => {
            return reportController.deleteReport(args)
        },
        report_status: (_, args) => {
            return reportController.updateReportStatus(args)
        }
    }
}