import {Collection, MongoClient} from 'mongodb';
import * as dotenv from 'dotenv';
import {Post} from '../models/post';
import {User} from '../models/user';

dotenv.config();

export interface DataService {
    mongoDBClient: MongoClient;
    postsCollection: Collection<Post>;
    usersCollection: Collection<User>;
}

let mDataService: DataService;

const reconnect = async (): Promise<MongoClient> => {
    try {
        return await MongoClient.connect(process.env.connectionString, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
    } catch {
        return null;
    }
};

const initializeDataService = (client: MongoClient): DataService => {
    return mDataService = {
        mongoDBClient: client,
        postsCollection: client.db('RestDB').collection('Posts'),
        usersCollection: client.db('RestDB').collection('Users')
    };
};

export const mongoDbCb = (dataServiceCallback: (dataService: DataService) => void) => {
    if (mDataService) {
        if (mDataService.mongoDBClient.isConnected()) {
            return dataServiceCallback(mDataService);
        }
    }
    reconnect().then(client => {
        if (client && client instanceof MongoClient) {
            return dataServiceCallback(initializeDataService(client));
        }
        dataServiceCallback(mDataService = null);
    });
};

export const mongoDbPromise = new Promise<DataService>(async (resolve, reject) => {
    if (mDataService) {
        if (mDataService.mongoDBClient.isConnected()) {
            return resolve(mDataService);
        }
    }
    const client = await reconnect();
    if (client && client instanceof MongoClient) {
        return resolve(initializeDataService(client));
    }
    mDataService = null;
    reject('Could not connect');
});
