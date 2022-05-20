import mongoose from 'mongoose';

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
			enum: ['clearance', 'indigency', 'identification'],
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

export default mongoose.model.Request ||
	mongoose.model('Request', requestSchema);
