const adminController = require('../controllers/admin_controller')

module.exports = {
    Query: {
        admins: () => {
            return adminController.getAllAdmin
        },
        admin: (_, args) => {
            return adminController.getAdminById(args)
        }
    },
    Mutation: {
        admin_auth: (_, args) => {
            return adminController.authAdminToken(args)
        },
        admin_login: (_, args) => {
            return adminController.authAdmin(args)
        },
        admin_signup: (_, args) => {
            return adminController.createAdmin(args)
        },
        admin_update: (_, args) => {
            return adminController.updateAdmin(args)
        },
        admin_verify_email: (_, args) => {
            return adminController.verifyEmailAdmin(args)
        },
        admin_reset_password: (_, args) => {
            return adminController.resetPersonnelPassword(args)
        },
    },
}