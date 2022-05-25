const Article = require('../models/articleModel');
const User = require('../models/userModel');
const userNotification = require('../models/userNotificationModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')


// @desc    Create barangay article
// @access  Private || Admin
const createArticle = asyncHandler(async (args) => {
    const { user_id, image, title, body, publish } = args;

    const user = User.findById(user_id)

    if (!user) {
        throw new ApolloError('User not found')
    }
    const articleLength = await Article.find()
    const running = leadingzero(articleLength.length + 1, 4)
    const artclId = 'artcl-22-' + running;

    const article = await Article.create({
        user: user_id,
        image: image,
        title,
        body,
        publish,
        artclId
    });

    if (article) return article
    else throw new ApolloError('Invalid data format');
});

// @desc    Update barangay article
// @access  Private || Admin
const updateArticle = asyncHandler(async (args) => {
    const article = await Article.findById(args.article_id)

    if (article) {
        article.image = args.image || article.image
        article.title = args.title || article.title
        article.body = args.body || article.body
        article.publish = args.publish || article.publish

        const updated_article = await article.save()
        return updated_article
    }
    else throw new Error('Article not found');

});

// @desc    Delete barangay article
// @access  Private || Admin
const deleteArticle = asyncHandler(async (args) => {
    const article = await Article.findById(args.article_id);

    if (article) {
        await article.remove();
        return { message: 'Article removed', }
    } else
        throw new ApolloError('Article not found');

});

// @desc    GET barangay article
// @access  Private
const getArticle = asyncHandler(async (args) => {
    const article = await Article.findById(args.id);

    if (!article) throw new ApolloError('Article not found');
    else return article

});

// @desc    GET All barangay articles
// @access  Private
const getAllArticle = asyncHandler(async () => {
    const articles = await Article.find();

    return articles
});

// @desc    Update barangay article
// @access  Private || Admin
const publishArticle = asyncHandler(async (args) => {
    const { articleId, status } = args

    const article = await Article.findById(articleId)
    if (!article) throw new Error('Article not found');

    article.publish = status;
    article.save()

    if (article.publish === true) {
        const user = await User.updateMany({}, { $set: { hasNewNotif: true } });

        const data = {
            type: "article",
            description: `${article.title} is now available. Check it.`,
            notifId: articleId
        }

        const notification = await userNotification.find()
        for (let i = 0; i < notification.length; i++) {
            notification[i].notifications.push(data)
            notification[i].save()
        }

        if (user && notification) return article
        else throw new ApolloError('Error encountered');
    } return article

});


module.exports = {
    createArticle,
    updateArticle,
    deleteArticle,
    getArticle,
    getAllArticle,
    publishArticle
};
