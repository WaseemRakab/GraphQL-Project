import * as express from 'express';
import {NextFunction, Request, Response} from 'express';
import {imageRouter} from './routes/image';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import {logError} from './util/logErrors';
import {isAuthenticated, verifyTokenGQLMidWare} from './middlewares/is-auth';
import {initSocketIO} from './socket';
import {typeDefs} from './graphql/schema';
import {resolvers} from './graphql/resolvers';
import {ApolloServer} from 'apollo-server-express';
const app = express();

app.use(cors({origin: '*'}));
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE',
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const graphQLMiddleWare = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
        if (!error.originalError) {
            return error;
        }
        const oError: any = error.originalError as any;
        const data = oError.data || [];
        const statusCode = oError.code || 500;
        const message = error.message;
        return {
            data,
            statusCode,
            success: false,
            message
        };
    },
    context: ({req}) => verifyTokenGQLMidWare(req.get('Authorization') || null),
});
graphQLMiddleWare.applyMiddleware({app});

app.use(bodyParser.json());
app.use('/api', isAuthenticated, imageRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logError(err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message,
        message: 'An Error Occurred!',
    });
});
const server = app.listen(8080, () => {
    console.log('listening to http server...');
});
initSocketIO(server);

process.on(
    'unhandledRejection',
    ((error) => {
        console.log(error);
    }),
);
