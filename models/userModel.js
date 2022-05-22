const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');
const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: [true, 'This field  is required'],
			validator: [validator.isEmail, 'Please enter valid email address'],
			unique: true,
		},
		password: {
			type: String,
			required: [true, 'This field is required'],
			select: false,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
	},
	{
		timestamps: true,
	}
);

userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}
	const salt = bcrypt.genSaltSync(10);
	this.password = await bcrypt.hashSync(this.password, salt);
});

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hash and set resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// Set token expire time
	this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
	return resetToken;
};

mongoose.models = {};
module.exports = mongoose.model.User || mongoose.model('User', userSchema);
