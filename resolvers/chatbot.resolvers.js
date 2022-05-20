const chatbotController = require('../controllers/chatbotController')
module.exports = {
    Query: {

    },
    Mutation: {
        ask: (_, args) => {
            return chatbotController.getAnswer(args.question)
        },
        create_chatbot: (_, args) => {
            return chatbotController.createChatbot(args)
        }
    }
}