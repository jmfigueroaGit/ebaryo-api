const path = require('path')
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const express = require('express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { loadFilesSync } = require('@graphql-tools/load-files')
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const dotenv = require('dotenv')
const dbConnect = require('./config/dbConnect')
const cors = require('cors')
const http = require('http')

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
    const httpServer = http.createServer(app);

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({ schema }, wsServer);


    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
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