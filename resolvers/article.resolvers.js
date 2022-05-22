const articleController = require('../controllers/articleController')
module.exports = {
    Query: {
        articles: () => {
            return articleController.getAllArticle()
        },
        article: (_, args) => {
            return articleController.getArticle(args)
        },
    },
    Mutation: {
        create_article: (_, args) => {
            return articleController.createArticle(args)
        },
        update_article: (_, args) => {
            return articleController.updateArticle(args)
        },
        delete_article: (_, args) => {
            return articleController.deleteArticle(args)
        }
    }
}