const userController = require('../controllers/userController')
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
        login: (_, args) => {
            return userController.authUser(args.email, args.password)
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
        }
    }
}