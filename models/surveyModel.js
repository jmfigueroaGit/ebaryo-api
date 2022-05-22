const mongoose = require('mongoose')

const question = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['']
    }
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
            required: true,
        },

    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.Survey ||
    mongoose.model('Survey', surveySchema);
