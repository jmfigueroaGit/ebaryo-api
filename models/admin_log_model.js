const mongoose = require('mongoose')

const AdminActivity = new mongoose.Schema({
    type: {
        type: String,
        enum: ['admin', 'survey', 'request', 'announcement', 'article', 'blotter', 'report', 'feedback']
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

const adminLogSchema = new mongoose.Schema(
    {
        admin: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Admin',
		},
        activities: [AdminActivity]
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.adminLogSchema ||
    mongoose.model('Adminlog', adminLogSchema);
