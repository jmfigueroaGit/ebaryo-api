import mongoose from 'mongoose';

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
		purpose: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: 'pending',
		},
	},
	{
		timestamps: true,
	}
);

mongoose.models = {};

export default mongoose.model.Report || mongoose.model('Report', reportSchema);
