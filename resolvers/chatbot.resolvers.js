const chatbotController = require('../controllers/chatbotController')
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
            return chatbotController.getAnswer(args.question)
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
    }
}