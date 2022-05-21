const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		request: {
			type: String,
			required: true,
		},
		purpose: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: 'pending',
			required: true
		},
	},
	{
		timestamps: true,
	}
);

mongoose.models = {};

module.exports = mongoose.model.Request ||
	mongoose.model('Request', requestSchema);