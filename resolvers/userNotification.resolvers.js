const surveyController = require('../controllers/surveyController')
const articleController = require('../controllers/articleController')
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