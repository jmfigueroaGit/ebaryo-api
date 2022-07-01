const barangayController = require('../controllers/barangay_controller')
module.exports = {
    Query: {
        barangays: () => {
            return barangayController.getAllBarangay()
        },
        barangay: (_, args) => {
            return barangayController.getBarangay(args)
        },
    },
    Mutation: {
        barangay_info_setup: (_, args) => {
            return barangayController.setupBarangayInfo(args)
        },
        barangay_officials_setup: (_, args) => {
            return barangayController.setupBarangayOfficial(args)
        },
        barangay_images_setup: (_, args) => {
            return barangayController.setupBarangayImages(args)
        },
        barangay_update: (_, args) => {
            return barangayController.updateBarangay(args)
        },
        barangay_delete: (_, args) => {
            return barangayController.deleteBarangay(args)
        }
    }
}