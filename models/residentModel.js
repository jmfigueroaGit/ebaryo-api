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
		},
		sex: {
			type: String,
			required: true,
			enum: ['Male', 'Female'],
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
		guardian: {
			fullname: { type: String, required: true },
			contact: { type: String, required: true },
			relationship: { type: String, required: true },
			address: { type: String, required: true },
		},
		address: {
			houseNumber: { type: String, required: true },
			street: { type: String, required: true },
			barangay: { type: String, required: true },
			region: { type: String, required: true },
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
