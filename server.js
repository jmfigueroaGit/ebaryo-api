const dotenv = require('dotenv')
const dbConnect = require('./config/db_connect')
const express = require('express');
const path = require('path')
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFilesSync } = require('@graphql-tools/load-files')
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const { ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault
} = require("apollo-server-core");

(async function () {
    dotenv.config();
    const app = express();
    const httpServer = createServer(app)

    const typeDefs = loadFilesSync(path.join(__dirname, '**/*.graphql'))
    const resolvers = loadFilesSync(path.join(__dirname, '**/*.resolvers.js'))

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    })

    const subscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe },
        { server: httpServer, path: '/graphql' }
    );

    const server = new ApolloServer({
        schema,
        cors: {
            origin: '*',			// <- allow request from all domains
            credentials: true},
        plugins: [
            // Install a landing page plugin based on NODE_ENV
            process.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageProductionDefault({
                graphRef: "my-graph-id@my-graph-variant",
                footer: false,
            })
            : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close()
                        }
                    };
                }
            }
        ]
    })

    await server.start();
    app.use(graphqlUploadExpress())
    server.applyMiddleware({ app })

    dbConnect();
    const PORT = 5000;
    httpServer.listen(process.env.PORT || PORT, () => {
        console.log(`???? Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
    })
})();