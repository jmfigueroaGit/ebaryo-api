const requestController = require('../controllers/requestController')
module.exports = {
    Query: {
        requests: () => {
            return requestController.getAllRequests()
        },
        request: (_, args) => {
            return requestController.getRequestById(args)
        },
        request_filter: (_, args) => {
            return requestController.getFilterRequests(args)
        },
        request_user: (_, args) => {
            return requestController.getUserRequests(args)
        }
    },
    Mutation: {
        request_create: (_, args) => {
            return requestController.createRequest(args)
        },
        request_update: (_, args) => {
            return requestController.updateRequest(args)
        },
        request_delete: (_, args) => {
            return requestController.deleteRequest(args)
        },

    }
}