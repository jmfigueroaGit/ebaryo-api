const surveyController = require('../controllers/survey_controller')

module.exports = {
    Query: {
        surveys: () => {
            return surveyController.getSurveys()
        },
        survey: (_, args) => {
            return surveyController.getSurvey(args)
        }
    },
    Mutation: {
        survey_create: (_, args) => {
            return surveyController.createSurvey(args);
        },
        survey_response: (_, args) => {
            return surveyController.submitResponce(args);
        },
        survey_update: (_, args) => {
            return surveyController.updateSurvey(args);
        }
    },
}