const { dockStart, containerBootstrap, Nlp, LangEn } = require('@nlpjs/basic');
const asyncHandler = require('express-async-handler');
const Chatbot = require('../models/chatbotModel')

const getAnswer = asyncHandler(async (question) => {
    const container = containerBootstrap();
    const tl = await Chatbot.findOne({ locale: "tl-Tl" })
    const en = await Chatbot.findOne({ locale: "en-US" })
    container.use(Nlp);
    container.use(LangEn);
    await dockStart();
    const nlp = container.get('nlp');
    nlp.settings.autoSave = false;
    await nlp.addCorpus(tl);
    await nlp.addCorpus(en);
    await nlp.train();
    let result = await nlp.process(question);
    if (result.intent === 'greetings.hello') {
        const hours = new Date().getHours();
        const output = result;
        if (hours < 12) {
            output.answer = 'Good morning!';
        } else if (hours < 17) {
            output.answer = 'Good afternoon!';
        } else {
            output.answer = 'Good evening!';
        }
        return output;
    }
    return { answer: result.answer }
})

const createChatbot = asyncHandler(async (args) => {
    const chatbot = await Chatbot.create({
        name: args.name,
        locale: args.locale,
        data: args.data
    })
    return chatbot
})

module.exports = {
    getAnswer,
    createChatbot
}