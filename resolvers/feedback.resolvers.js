const feedbackController = require('../controllers/feedbackController')

module.exports = {
    Query: {
        feedbacks: () => {
            return feedbackController.getFeedbacks()
        },
        feedback: (_, args) => {
            return feedbackController.getFeedback(args)
        },
        feedbacks_filter: (_, args) => {
            return feedbackController.filterFeedbacks(args)
        },
    },
    Mutation: {
        feedback_create: (_, args) => {
            return feedbackController.createFeedback(args)
        },
        feedback_status: (_, args) => {
            return feedbackController.updateFeedbackStatus(args)
        }
    }
}