const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
	{
		authorized: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Authorized"
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
