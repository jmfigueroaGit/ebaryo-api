const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid')

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
			required: true
		},
		transactionId: {
			type: String
		}
	},
	{
		timestamps: true,
	}
);

requestSchema.pre('save', async function (next) {
	const data = 'qwertyuiopasdfghjklzxcvbnm1234567890' + new Date().getTime()
	const first_data = "ebaryobarangaymanagementsystemwithdatavisualizationandaichatbot"
	const nanoid = customAlphabet(data, 10)
	const first = customAlphabet(first_data, 10)
	const year = new Date().getFullYear();
	this.transactionId = first(3) + nanoid(5) + "-" + year;
});

mongoose.models = {};
module.exports = mongoose.model.Request ||
	mongoose.model('Request', requestSchema);