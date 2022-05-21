const requestController = require('../controllers/requestController')
module.exports = {
    Query: {
        requests: () => {
            return requestController.getAllRequests()
        },
        request: (_, args) => {
            return requestController.getRequestById(args)
        },
        request_user: (_, args) => {
            return requestController.getUserRequests(args)
        }
    },
    Mutation: {
        create_request: (_, args) => {
            return requestController.createRequest(args)
        },
        update_request: (_, args) => {
            return requestController.updateRequest(args)
        },
        delete_request: (_, args) => {
            return requestController.deleteRequest(args)
        }
    }
}