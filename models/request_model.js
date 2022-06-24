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
			enum: ['Barangay Certificate',
				'Barangay ID',
				'Barangay Clearance',
				'Business Clearance',
				'Certificate of Indigency',
				'Certificate of Residency',
				'First Time Jobseeker',]
		},
		purpose: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: 'pending',
			enum: ["pending", "on process", "for release", "rejected", "claimed"]
		},
		transactionId: {
			type: String,
			required: true
		}
	},
	{
		timestamps: true,
	}
);


mongoose.models = {};
module.exports = mongoose.model.Request ||
	mongoose.model('Request', requestSchema);