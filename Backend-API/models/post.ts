import {ObjectID} from 'mongodb';

export interface Post {
    // tslint:disable-next-line:variable-name
    _id?: ObjectID;
    title: string;
    userId: ObjectID;
    content: string;
    creatorName: string;
    createdDate: Date | string;
    updatedDate: Date | string;
    image: string;
}
