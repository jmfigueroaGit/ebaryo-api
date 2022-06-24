const residentController = require('../controllers/resident_controller')
module.exports = {
    Query: {
        residents: () => {
            return residentController.getAllResidents()
        },
        residents_filter: (_, args) => {
            return residentController.getFilterResidents(args)
        },
        resident: (_, args) => {
            return residentController.getResident(args.id)
        },
        resident_user: (_, args) => {
            return residentController.getResidentById(args.user_id)
        }
    },
    Mutation: {
        resident_create: (_, args) => {
            return residentController.createResident(args)
        },
        resident_update: (_, args) => {
            return residentController.updateResident(args)
        },
        resident_delete: (_, args) => {
            return residentController.deleteResident(args)
        }
    }
}