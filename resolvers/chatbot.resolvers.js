const chatbotController = require('../controllers/chatbotController')
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
module.exports = {
    Query: {
        chatbot_tl_questions: () => {
            return chatbotController.getTlChatbotQuestion()
        },
        chatbot_en_questions: () => {
            return chatbotController.getEnChatbotQuestion()
        }
    },
    Mutation: {
        chatbot_ask: (_, args) => {
            const answer = chatbotController.getAnswer(args.question)
            pubsub.publish("GET_MESSAGE", { chatbot_convo: answer })
            return answer
        },
        chatbot_create: (_, args) => {
            return chatbotController.createChatbot(args)
        },
        chatbot_tl_train: (_, args) => {
            return chatbotController.trainTlChatbot(args)
        },
        chatbot_en_train: (_, args) => {
            return chatbotController.trainEnChatbot(args)
        },
        chatbot_tl_delete: (_, args) => {
            return chatbotController.deleteTlQuestion(args)
        },
        chatbot_en_delete: (_, args) => {
            return chatbotController.deleteEnQuestion(args)
        }
    },
    Subscription: {
        chatbot_convo: {
            subscribe: () => pubsub.asyncIterator(["GET_MESSAGE"]),
        }
    }
}