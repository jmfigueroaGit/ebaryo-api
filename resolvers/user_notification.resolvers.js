const surveyController = require('../controllers/survey_controller')
const articleController = require('../controllers/article_controller')
const requestController = require('../controllers/request_controller')
const userNotificationController = require('../controllers/user_notification_controller')
const announcementController = require('../controllers/announcement_controller')
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

module.exports = {
    Query: {
        notification_user: (_, args) => {
            return userNotificationController.getNotificationById(args)
        },
    },
    Mutation: {
        publish_survey: (_, args) => {
            const notif = surveyController.publishSurvey(args)
            if (args.status === true)
                pubsub.publish("steam_notification", { notification: "New notification added" })
            return notif
        },
        publish_article: (_, args) => {
            const article = articleController.publishArticle(args)
            if (args.status === true)
                pubsub.publish("steam_notification", { notification: "New notification added" })
            return article
        },
        publish_announcement: (_, args) => {
            const announcement = announcementController.publishAnnouncement(args)
            if (args.status === true)
                pubsub.publish("steam_notification", { notification: "New notification added" })
            return announcement 
        },
        request_status: (_, args) => {
            const request = requestController.changeRequestStatus(args)
            pubsub.publish("steam_notification", { notification: "New notification added" })
            return request
        }
    },
    Subscription: {
        notification: {
            subscribe: (_, args) => {
                return pubsub.asyncIterator(`steam_notification`)
            }
        }
    }
}