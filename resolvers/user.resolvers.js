const userController = require('../controllers/userController')
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
module.exports = {
    Query: {
        users: () => {
            const users = userController.getAllUsers()
            pubsub.publish('GET_USERS', {
                users: users
            })
            return users
        },
        users_filter: (_, args) => {
            return userController.getFilterUsers(args)
        },
        user: (_, args) => {
            return userController.getUserById(args.id)
        },
        read_notif: (_, args) => {
            return userController.readNotification(args)
        }
    },
    Mutation: {
        login: (_, args, context) => {
            const user = userController.authUser(args.email, args.password)
            pubsub.publish('LOGIN_USER', {
                loginUser: user
            })
            return user
        },
        signup: (_, args) => {
            return userController.signupUser(args.email, args.password)
        },
        update: (_, args) => {
            return userController.updateUser(args)
        },
        auth: (_, args) => {
            return userController.authToken(args.token)
        },
        delete: (_, args) => {
            return userController.deleteUser(args.id)
        },
        verify_email: (_, args) => {
            return userController.verifyEmail(args.email)
        },
        reset_password: (_, args) => {
            return userController.resetPassword(args)
        }
    },
    Subscription: {
        users: {
            subscribe: () => pubsub.asyncIterator(["GET_USERS"]),
        },
        loginUser: {
            subscribe: () => pubsub.asyncIterator(["LOGIN_USER"]),
        },
    }
}

