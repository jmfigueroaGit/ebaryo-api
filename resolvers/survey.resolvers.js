const surveyController = require('../controllers/surveyController')

module.exports = {
    Query: {
        surveys: () => {
            return surveyController.getSurveys()
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