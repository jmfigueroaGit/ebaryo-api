const Article = require('../models/articleModel');
const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const User = require('../models/userModel')
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

module.exports = {
    createArticle,
    updateArticle,
    deleteArticle,
    getArticle,
    getAllArticle,
};
