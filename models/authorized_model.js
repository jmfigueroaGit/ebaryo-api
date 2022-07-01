const mongoose = require('mongoose')
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const authorizedSchema = new mongoose.Schema(
    {
        name: {
            first: { type: String, required: true },
            middle: { type: String, required: true },
            last: { type: String, required: true },
            extension: { type: String },
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true
        },
        sex: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: [true, 'This field is required'],
            select: false,
        },
        image: {
			public_id: {
				type: String,
				required: true
			},
			url: {
				type: String,
				required: true
			},
		},
        role:{
            type: String,
            required: true,
            enum: ["admin", "moderator"],
            default: "moderator"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        hasNewNotif: {
			type: Boolean,
			default: false
		},
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        barangay: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Barangay',
		},
    },
    {
        timestamps: true,
    }
);

authorizedSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

authorizedSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hashSync(this.password, salt);
});

// Generate password reset token
authorizedSchema.methods.getResetPasswordToken = function () {
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
module.exports = mongoose.model.Authorized ||
    mongoose.model('Authorized', authorizedSchema);
