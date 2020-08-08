import {ObjectID} from 'mongodb';

export class User {
    // tslint:disable-next-line:variable-name
    _id: ObjectID;
    email: string;
    password: string;
    name: string;
    status = 'I am new!';

    constructor(email: string, password: string, name: string, status?: string) {
        this.email = email;
        this.password = password;
        this.name = name;
        if (status) {
            this.status = status;
        }
    }

    /*posts: {
        _id: ObjectID,
        posts: Post[]
    };*/
}
