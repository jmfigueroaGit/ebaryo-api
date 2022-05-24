const residentController = require('../controllers/residentController')
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
        create_resident: (_, args) => {
            return residentController.createResident(args)
        },
        update_resident: (_, args) => {
            return residentController.updateResident(args)
        },
        delete_resident: (_, args) => {
            return residentController.deleteResident(args)
        }
    }
}