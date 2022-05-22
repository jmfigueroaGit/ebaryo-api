const path = require('path')
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { loadFilesSync } = require('@graphql-tools/load-files')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { applyMiddleware } = require('graphql-middleware')
const dotenv = require('dotenv')
const dbConnect = require('./config/dbConnect')
const cors = require('cors')
const { resolve } = require('path')

dotenv.config()

dbConnect()

const typeDefs = loadFilesSync(path.join(__dirname, '**/*.graphql'))
const resolvers = loadFilesSync(path.join(__dirname, '**/*.resolvers.js'))

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

const uppercaseEmail = async (resolve, parent, args, context, info) => {
    const result = await resolve(parent, args, context, info)


}

// For middleware
// const userMiddleware = {
//     Query: {
//         users: uppercaseEmail
//     }
// }
// const middleware = [userMiddleware]
// const schemaWithMiddleware = applyMiddleware(schema, ...middleware)

const app = express();
app.use(cors())

app.use('/graphql', graphqlHTTP({
    schema: schema
    ,
    graphiql: true
}))

app.listen(process.env.PORT || 5000, () => {
    console.log(`Running in PORT ${process.env.PORT}`);
});