const authorizedController = require('../controllers/authorized_controller')
module.exports = {
    Query: {
        personnels: () => {
            return authorizedController.getAllPersonnels()
        },
        personnel: (_, args) => {
            return authorizedController.getPersonnelById(args)
        },


    },
    Mutation: {
        personnel_login: (_, args) => {
            return authorizedController.authPersonnel(args)
        },
        personnel_signup: (_, args) => {
            return authorizedController.createPersonnel(args)
        },
        personnel_update: (_, args) => {
            return authorizedController.updatePersonnel(args)
        },
        personnel_auth: (_, args) => {
            return authorizedController.authPersonnelToken(args.token)
        },
        personnel_delete: (_, args) => {
            return authorizedController.deletePersonnel(args)
        },
        personnel_verify_email: (_, args) => {
            return authorizedController.verifyEmailPersonnel(args)
        },
        personnel_reset_password: (_, args) => {
            return authorizedController.resetPersonnelPassword(args)
        },
        personnel_account_status: (_, args) => {
            return authorizedController.updateStatusPersonnel(args)
        },
    }
}

