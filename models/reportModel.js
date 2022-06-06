const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		report: {
			type: String,
			required: true,
			enum: ["INCIDENT", "UTILITY PROBLEM", "COMMUNITY PROBLEM"]
		},
		description: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: 'unread',
			enum: ["unread", "read", "in progress", "actioned", "achived"]
		},
		transactionId: {
			type: String,
			required: true,
		}
	},
	{
		timestamps: true,
	}
);


mongoose.models = {};

module.exports = mongoose.model.Report || mongoose.model('Report', reportSchema);
