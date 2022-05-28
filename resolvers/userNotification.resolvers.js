const surveyController = require('../controllers/surveyController')
const articleController = require('../controllers/articleController')
const requestController = require('../controllers/requestController')
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

module.exports = {
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