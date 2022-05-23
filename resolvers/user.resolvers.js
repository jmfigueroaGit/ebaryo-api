const userController = require('../controllers/userController')
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
module.exports = {
    Query: {
        users: () => {
            return userController.getAllUsers()
        },
        user: (_, args) => {
            return userController.getUserById(args.id)
        },
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
        loginUser: {
            subscribe: () => pubsub.asyncIterator(["LOGIN_USER"]),
        },
    }
}

