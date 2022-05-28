const blotterController = require('../controllers/blotterController')

module.exports = {
    Query: {
        blotters: () => {
            return blotterController.getBlotters()
        },
        blotter: (_, args) => {
            return blotterController.getBlotter(args)
        }
    },
    Mutation: {
        blotter_create: (_, args) => {
            return blotterController.createBlotter(args)
        },
        blotter_update: (_, args) => {
            return blotterController.updateBlotter(args)
        },
        blotter_status: (_, args) => {
            return blotterController.statusBlotter(args)
        }
    }
}