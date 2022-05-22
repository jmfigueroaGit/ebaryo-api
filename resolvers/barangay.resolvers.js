const barangayController = require('../controllers/barangayController')
module.exports = {
    Query: {
        barangays: () => {
            return barangayController.getAllBarangay()
        },
        barangay: (_, args) => {
            return barangayController.getBarangayById(args)
        },
    },
    Mutation: {
        create_barangay: (_, args) => {
            return barangayController.createBarangay(args)
        },
        update_barangay: (_, args) => {
            return barangayController.updateBarangay(args)
        },
        delete_barangay: (_, args) => {
            return barangayController.deleteBarangay(args)
        }
    }
}