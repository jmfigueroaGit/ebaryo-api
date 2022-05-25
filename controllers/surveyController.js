const Survey = require('../models/surveyModel');
const User = require('../models/userModel');
const userNotification = require('../models/userNotificationModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')


// @desc    Create barangay survey
// @access  Private
const createSurvey = asyncHandler(async (args) => {
    const { title, description, questions } = args;

    const survey = await Survey.create({
        title,
        description,
        questions,
    });

    if (survey) {
        return survey
    } else {
        throw new ApolloError('Invalid data format');
    }
});


// @desc    Create barangay survey
// @access  Private
const updateSurvey = asyncHandler(async (args) => {
    const { surveyId, title, description, questions } = args;

    const survey = await Survey.findById(surveyId)
    if (!survey) throw new ApolloError('Survey not found');
    if (survey.publish === false) {
        survey.title = title || survey.title
        survey.description = description || survey.description
        survey.questions = questions || survey.questions
        survey.save()
        if (survey) {
            return survey
        } else {
            throw new ApolloError('Invalid data format');
        }
    }
    else {
        throw new ApolloError('Survey is currently published. Unabled to modify.');
    }
});


const getSurveys = asyncHandler(async () => {
    const surveys = await Survey.find().populate({
        path: 'questions.responses.user',
        select: '_id email isVerified'
    })
    return surveys
})

const submitResponce = asyncHandler(async (args) => {
    const survey = await Survey.findById(args.surveyId)

    if (!survey) throw new ApolloError('Survey not found!');
    const { responses } = args
    for (let i = 0; i < survey.questions.length; i++) {
        if (survey.questions[i]._id.toString() === responses[i]._id) {
            let data = {
                answer: responses[i].answer,
                user: responses[i].user
            }
            survey.questions[i].responses.push(data);
        }
    }

    if (survey.save())
        return survey
})

const publishSurvey = asyncHandler(async (args) => {
    const { surveyId, status } = args

    const survey = await Survey.findById(surveyId)
    if (!survey) throw new ApolloError('Survey not found');

    survey.publish = status
    survey.save()

    if (survey.publish === true) {
        const user = await User.updateMany({}, { $set: { hasNewNotif: true } });

        const data = {
            type: "survey",
            description: `${survey.title} is now available. Check it.`,
            notifId: surveyId
        }

        const notification = await userNotification.find()
        for (let i = 0; i < notification.length; i++) {
            notification[i].notifications.push(data)
            notification[i].save()
        }

        if (user && notification) return survey
        else throw new ApolloError('Error encountered');
    } else { return survey }
})

module.exports = {
    createSurvey,
    getSurveys,
    submitResponce,
    publishSurvey,
    updateSurvey
};
