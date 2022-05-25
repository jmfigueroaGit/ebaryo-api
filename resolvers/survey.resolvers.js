const surveyController = require('../controllers/surveyController')

module.exports = {
    Query: {
        surveys: () => {
            return surveyController.getSurveys()
        }
    },
    Mutation: {
        create_survey: (_, args) => {
            return surveyController.createSurvey(args);
        },
        response_survey: (_, args) => {
            return surveyController.submitResponce(args);
        },
    },
}