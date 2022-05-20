import mongoose from 'mongoose ';

const articleSchema = new mongoose.Schema(
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
		title: {
			type: String,
			required: true,
		},
		body: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

mongoose.models = {};
export default mongoose.model.Article ||
	mongoose.model('Article', articleSchema);
