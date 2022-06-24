const mongoose = require('mongoose')

const AuthorizedActivity = new mongoose.Schema({
    type: {
        type: String,
        enum: ['authorized', 'survey', 'request', 'announcement', 'article', 'blotter', 'report', 'feedback']
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now()
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
    }
})

const authorizedLogSchema = new mongoose.Schema(
    {
        authorized: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Authorized',
		},
        activities: [AuthorizedActivity]
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.authorizedLogSchema ||
    mongoose.model('Authorizedlog', authorizedLogSchema);
