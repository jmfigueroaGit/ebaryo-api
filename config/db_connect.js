const mongoose = require('mongoose');

const dbConnect = () => {
	if (mongoose.connection.releaseState > 1) {
		return;
	}

	mongoose
		.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then((con) => console.log('Connected to database'));
};

module.exports = dbConnect;
