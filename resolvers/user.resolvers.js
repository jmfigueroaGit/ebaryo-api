const userController = require('../controllers/user_controller');
const { GraphQLUpload } = require('graphql-upload');
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
module.exports = {
	Upload: GraphQLUpload,
	Query: {
		users: () => {
			const users = userController.getAllUsers();
			pubsub.publish('GET_USERS', {
				users: users,
			});
			return users;
		},
		users_filter: (_, args) => {
			return userController.getFilterUsers(args);
		},
		user: (_, args) => {
			return userController.getUserById(args.id);
		},
		user_read_notif: (_, args) => {
			return userController.readNotification(args);
		},
	},
	Mutation: {
		user_login: (_, args, context) => {
			const user = userController.authUser(args.email, args.password);
			pubsub.publish('LOGIN_USER', {
				loginUser: user,
			});
			return user;
		},
		user_update: (_, args) => {
			return userController.updateUser(args);
		},
		user_auth: (_, args) => {
			return userController.authToken(args.token);
		},
		user_delete: (_, args) => {
			return userController.deleteUser(args.id);
		},
		user_verify_email: (_, args) => {
			return userController.verifyEmail(args.email);
		},
		user_reset_password: (_, args) => {
			return userController.resetPassword(args);
		},
	},
	Subscription: {
		users: {
			subscribe: () => pubsub.asyncIterator(['GET_USERS']),
		},
		user_loginUser: {
			subscribe: () => pubsub.asyncIterator(['LOGIN_USER']),
		},
	},
};
