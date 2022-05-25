const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['multiple choice', 'checkbox', 'text']
    },
    question: {
        type: String,
        required: true
    },
    choices: [{ type: String }],
    responses: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            answer: [{ type: String }]
        }
    ]
})

const surveySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        publish: {
            type: Boolean,
            default: false,
        },
        questions: [questionSchema]
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.Survey ||
    mongoose.model('Survey', surveySchema);
