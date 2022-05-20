const path = require('path')
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { loadFilesSync } = require('@graphql-tools/load-files')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const dotenv = require('dotenv')
const dbConnect = require('./config/dbConnect')
const cors = require('cors')

dotenv.config()

dbConnect()

const typeDefs = loadFilesSync(path.join(__dirname, '**/*.graphql'))
const resolvers = loadFilesSync(path.join(__dirname, '**/*.resolvers.js'))

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

const app = express();
app.use(cors())

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(5000, () => {
    console.log('Running Graphql server...');
});