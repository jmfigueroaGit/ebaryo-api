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
    if (result.intent === 'None') {
        if (result.locale === 'tl') {
            let data = null
            for (let i = 0; i < tl.data.length; i++) {
                if (tl.data[i].intent === 'None') {
                    data = tl.data[i].utterances
                    data.push(result.utterance)
                    tl.data[i].utterances = data
                    tl.save()
                }
            }
        }
        if (result.locale == 'en') {
            let data = null
            for (let i = 0; i < en.data.length; i++) {
                if (en.data[i].intent === 'None') {
                    data = en.data[i].utterances
                    data.push(result.utterance)
                    en.data[i].utterances = data
                    en.save()
                }
            }
        }
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

const getTlChatbotQuestion = asyncHandler(async (args) => {
    const tl = await Chatbot.findOne({ locale: "tl-Tl" })
    let data = null;
    for (let i = 0; i < tl.data.length; i++) {
        if (tl.data[i].intent === 'None') {
            data = tl.data[i].utterances
        }
    }
    return { data }
})

const trainTlChatbot = asyncHandler(async (args) => {
    const tl = await Chatbot.findOne({ locale: "tl-Tl" })
    for (let i = 0; i < tl.data.length; i++) {
        if (tl.data[i].intent === 'None') {
            for (let j = 0; j < tl.data[i].utterances.length; j++) {
                if (tl.data[i].utterances[j] === args.question) {
                    let newData = {
                        intent: `question-${tl.data.length + 1}`,
                        utterances: [tl.data[i].utterances[j]],
                        answers: [args.answer]
                    };
                    tl.data.push(newData)
                    tl.data[i].utterances.splice(j, 1);
                    tl.save()
                    return { answer: "Train chatbot success" }
                }
            }
        }
    }
})

const deleteTlQuestion = asyncHandler(async (args) => {
    const tl = await Chatbot.findOne({ locale: "tl-Tl" })
    for (let i = 0; i < tl.data.length; i++) {
        if (tl.data[i].intent === 'None') {
            for (let j = 0; j < tl.data[i].utterances.length; j++) {
                if (tl.data[i].utterances[j] === args.question) {
                    tl.data[i].utterances.splice(j, 1);
                    tl.save()
                    return { message: "Question deleted successfully" }
                }
            }
        }
    }
})

const getEnChatbotQuestion = asyncHandler(async (args) => {
    const en = await Chatbot.findOne({ locale: "en-US" })
    let data = null;
    for (let i = 0; i < en.data.length; i++) {
        if (en.data[i].intent === 'None') {
            data = en.data[i].utterances
        }
    }
    return { data }
})

const trainEnChatbot = asyncHandler(async (args) => {
    const en = await Chatbot.findOne({ locale: "en-US" })
    for (let i = 0; i < en.data.length; i++) {
        if (en.data[i].intent === 'None') {
            for (let j = 0; j < en.data[i].utterances.length; j++) {
                if (en.data[i].utterances[j] === args.question) {
                    let newData = {
                        intent: `question-${en.data.length + 1}`,
                        utterances: [en.data[i].utterances[j]],
                        answers: [args.answer]
                    };
                    en.data.push(newData)
                    en.data[i].utterances.splice(j, 1);
                    en.save()
                    return { answer: "Train chatbot success" }
                }
            }
        }
    }

})

const deleteEnQuestion = asyncHandler(async (args) => {
    const en = await Chatbot.findOne({ locale: "en-US" })
    for (let i = 0; i < en.data.length; i++) {
        if (en.data[i].intent === 'None') {
            for (let j = 0; j < en.data[i].utterances.length; j++) {
                if (en.data[i].utterances[j] === args.question) {
                    en.data[i].utterances.splice(j, 1);
                    en.save()
                    return { message: "Question deleted successfully" }
                }
            }
        }
    }
})

module.exports = {
    getAnswer,
    createChatbot,
    getTlChatbotQuestion,
    getEnChatbotQuestion,
    trainTlChatbot,
    trainEnChatbot,
    deleteTlQuestion,
    deleteEnQuestion
}