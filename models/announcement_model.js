const mongoose = require('mongoose');

const annoucementSchema = new mongoose.Schema(
	{
		authorized: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Authorized"
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
		subject: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		postedUntil: {
			type: Date,
			required: true
		},
		viewCounts: {
			type: Number,
			default: 0
		},
		publish: {
			type: Boolean,
			default: false
		},
		ancmtId: {
			type: String,
			required: true
		}

	},
	{
		timestamps: true,
	}
);

mongoose.models = {};
module.exports = mongoose.model.Announcement ||
	mongoose.model('Announcement', annoucementSchema);
