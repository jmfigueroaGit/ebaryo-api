const articleController = require('../controllers/article_controller')
module.exports = {
    Query: {
        articles: () => {
            return articleController.getAllArticle()
        },
        article: (_, args) => {
            return articleController.getArticle(args)
        },
        articles_filter: (_, args) => {
            return articleController.filterArticles(args)
        },
    },
    Mutation: {
        article_create: (_, args) => {
            return articleController.createArticle(args)
        },
        article_update: (_, args) => {
            return articleController.updateArticle(args)
        },
        article_delete: (_, args) => {
            return articleController.deleteArticle(args)
        }
    }
}