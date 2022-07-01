const mongoose = require('mongoose')

const residentSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		name: {
			first: { type: String, required: true },
			middle: { type: String, required: true },
			last: { type: String, required: true },
			extension: { type: String },
		},
		sex: {
			type: String,
			required: true,
			enum: ['male', 'female'],
		},
		birthday: {
			type: Date,
			required: true,
		},
		nationality: {
			type: String,
			required: true,
		},
		mobileNumber: {
			type: String,
			required: true,
			unique: true
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		address: {
			houseNumber: { type: String, required: true },
			street: { type: String, required: true },
			barangay: { type: String, required: true },
			province: { type: String, required: true },
			city: { type: String, required: true },
			zipcode: { type: String, required: true },
		},
		residentId: {
			type: String,
			required: true
		}
	},
	{
		timestamps: true,
	}
);

mongoose.models = {};
module.exports = mongoose.model.Resident ||
	mongoose.model('Resident', residentSchema);
