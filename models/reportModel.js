const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid')

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
		},
		description: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: 'pending',
		},
		transactionId: {
			type: String
		}
	},
	{
		timestamps: true,
	}
);

reportSchema.pre('save', async function (next) {
	const data = 'qwertyuiopasdfghjklzxcvbnm1234567890' + new Date().getTime()
	const nanoid = customAlphabet(data, 10);
	const year = new Date().getFullYear();
	this.transactionId = year + "-" + nanoid(6);
});

mongoose.models = {};

module.exports = mongoose.model.Report || mongoose.model('Report', reportSchema);
