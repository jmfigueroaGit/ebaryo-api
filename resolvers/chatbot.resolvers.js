const chatbotController = require('../controllers/chatbotController')
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
module.exports = {
    Query: {
        tl_questions: () => {
            return chatbotController.getTlChatbotQuestion()
        },
        en_questions: () => {
            return chatbotController.getEnChatbotQuestion()
        }
    },
    Mutation: {
        ask: (_, args) => {
            const answer = chatbotController.getAnswer(args.question)
            pubsub.publish("GET_MESSAGE", { messageConvo: answer })
            return answer
        },
        create_chatbot: (_, args) => {
            return chatbotController.createChatbot(args)
        },
        answerTlChatbot: (_, args) => {
            return chatbotController.trainTlChatbot(args)
        },
        answerEnChatbot: (_, args) => {
            return chatbotController.trainEnChatbot(args)
        },
        deleteTlQuestion: (_, args) => {
            return chatbotController.deleteTlQuestion(args)
        },
        deleteEnQuestion: (_, args) => {
            return chatbotController.deleteEnQuestion(args)
        }
    },
    Subscription: {
        messageConvo: {
            subscribe: () => pubsub.asyncIterator(["GET_MESSAGE"]),
        },
        notification: {
            subscribe: (_, args) => {
                return pubsub.asyncIterator(`steam_${args.id}`)
            }
        }
    }
}