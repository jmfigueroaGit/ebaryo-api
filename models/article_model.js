const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
		image: {
			public_id: {
				type: String,
				default: "image.id"
			},
			url: {
				type: String,
				default: "image url"
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
		publish: {
			type: Boolean,
			default: false
		},
		artclId: {
			type: String,
			required: true
		}
	},
	{
		timestamps: true,
	}
);

mongoose.models = {};
module.exports = mongoose.model.Article ||
	mongoose.model('Article', articleSchema);
