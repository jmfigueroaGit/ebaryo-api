const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    intent: {
        type: String,
        required: true
    },
    utterances: [{
        type: String,
        required: true
    }],
    answers: [{
        type: String,
        required: true
    }]
})

const chatbotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    locale: {
        type: String,
        required: true,
    },
    data: [dataSchema]
}, {
    timestamps: true
})

mongoose.models = {};
module.exports = mongoose.model.Chatbot ||
    mongoose.model('Chatbot', chatbotSchema);
