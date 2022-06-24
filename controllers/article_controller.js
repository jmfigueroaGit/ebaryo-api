const asyncHandler = require('express-async-handler');
const { ApolloError } = require('apollo-server')
const leadingzero = require('leadingzero')

const Article = require('../models/article_model');
const Authorized = require('../models/authorized_model');
const Admin = require('../models/admin_model')
const User = require('../models/user_model');
const userNotification = require('../models/user_notification_model');
const Adminlog = require('../models/admin_log_model')
const Authorizedlog = require('../models/authorized_log_model')

// @desc    Create barangay article
// @access  Private || Admin
const createArticle = asyncHandler(async (args) => {
    const { author, imageUrl, publicId, title, body, publish } = args;


    const articleLength = await Article.find()
    const running = leadingzero(articleLength.length + 1, 4)
    const artclId = 'artcl-22-' + running;

    const article = await Article.create({
        author,
        image: {
            public_id: publicId,
            url: imageUrl
        },
        title,
        body,
        publish,
        artclId
    });

    if (article){
        const admin = await Admin.findById(author)
        const authorized = await Authorized.findById(author)

        if(admin){
            const activityLogs = await Adminlog.findOne({ admin: author })
            const adminActivity = {
                type: "article",
                title: "Created an Article",
                description: `${article.title} - ${article.artclId.toUpperCase()}`,
                activityId: article._id
            }
            activityLogs.activities.push(adminActivity)
            activityLogs.save()
        } else if (authorized){
            const activityLogs = await Authorizedlog.findOne({ admin: author })
            const authorizedActivity = {
                type: "article",
                title: "Created an Article",
                description: `${article.title} - ${article.artclId.toUpperCase()}`,
                activityId: article._id
            }
            activityLogs.activities.push(authorizedActivity)
            activityLogs.save()
        }  
        if (article.publish === true) {
            const user = await User.updateMany({}, { $set: { hasNewNotif: true } });
    
            const data = {
                type: "article",
                description: `${article.title} is now available. Check it.`,
                notifId: article._id
            }
    
            const notification = await userNotification.find()
            for (let i = 0; i < notification.length; i++) {
                notification[i].notifications.push(data)
                notification[i].save()
            }
    
            if (user && notification) return article
            else throw new ApolloError('Error encountered');
        } 
        else return article
    }
    else throw new ApolloError('Invalid data format');
});

// @desc    Update barangay article
// @access  Private || Admin
const updateArticle = asyncHandler(async (args) => {
    const article = await Article.findById(args.article_id)

    if (article.publish === true) throw new ApolloError('Article cannot be updated once it is published')

    if (article) {
        article.image.public_id = args.publicId || article.image.public_id
        article.image.url = args.imageUrl || article.image.url
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
    const article = await Article.findById(args.id)

    if (!article) throw new ApolloError('Article not found');
    else return article

});

// @desc    GET All barangay articles
// @access  Private
const getAllArticle = asyncHandler(async () => {
    const articles = await Article.find()

    return articles
});

// @desc    Filter barangay articles
// @access  Private
const filterArticles = asyncHandler(async (args) => {
    const { value } = args
    const articles = await Article.find({
        "$or": [
            { title: { $regex: value } },
            { artclId: { $regex: value } },
            { body: { $regex: value } }
        ]
    })

    return articles
})

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
    } 
    else return article
});


module.exports = {
    createArticle,
    updateArticle,
    deleteArticle,
    getArticle,
    getAllArticle,
    publishArticle,
    filterArticles
};
