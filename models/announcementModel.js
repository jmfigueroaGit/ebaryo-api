import mongoose from 'mongoose ';

const annoucementSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		image: {
			public_id: {
				type: String,
				required: true,
			},
			url: {
				type: String,
				required: true,
			},
		},
		description: {
			type: String,
			required: true,
		},
		viewCounts: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);

mongoose.models = {};
export default mongoose.model.Announcement ||
	mongoose.model('Announcement', annoucementSchema);
