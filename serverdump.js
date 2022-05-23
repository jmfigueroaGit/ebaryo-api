const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const express = require('express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const dotenv = require('dotenv')
const dbConnect = require('./config/dbConnect')
const http = require('http')
const path = require('path')
const { loadFilesSync } = require('@graphql-tools/load-files')

dotenv.config()
dbConnect()

async function startApolloServer() {
    const typeDefs = loadFilesSync(path.join(__dirname, '**/*.graphql'))
    const resolvers = loadFilesSync(path.join(__dirname, '**/*.resolvers.js'))

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    })

    const app = express();
    const httpServer = createServer(app);

    // Create our WebSocket server using the HTTP server we just set up.
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    // Save the returned server's info so we can shutdown this server later
    const serverCleanup = useServer({ schema }, wsServer);

    // Set up ApolloServer.
    const server = new ApolloServer({
        schema,
        csrfPrevention: true,  // see below for more about this
        cors: {
            origin: ["*", "*"]
        },
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),
            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });

    await server.start();
    server.applyMiddleware({ app });

    const PORT = 5000;
    // Now that our HTTP server is fully set up, we can listen to it.
    httpServer.listen(process.env.PORT || PORT, () => {
        console.log(
            `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`,
        );
    });
}

startApolloServer()