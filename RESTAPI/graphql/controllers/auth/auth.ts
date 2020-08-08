import validator from 'validator';
import {mongoDbPromise} from '../../../util/database';
import * as crypt from '../../../util/crypt';
import {User} from '../../../models/user';
import * as jwt from 'jsonwebtoken';
import {verifyTokenGQLMidWare} from '../../../middlewares/is-auth';
import {logError} from '../../../util/logErrors';
import isEmail = validator.isEmail;
import isEmpty = validator.isEmpty;
import isLength = validator.isLength;

type userAuthType = { email: string, password: string };
type userSignupType = userAuthType & { name: string };

const checkUserCreateSchema = (userInput: userSignupType): string[] => {
    const errors: string[] = [];
    if (!isEmail(userInput.email)) {
        errors.push('Email Invalid!');
    }
    if (isEmpty(userInput.password) || !isLength(userInput.password, {min: 8})) {
        errors.push('Password must be at least 8 characters long!');
    }
    if (isEmpty(userInput.name)) {
        errors.push('Name must be included !');
    }
    return errors;
};

const checkUserSignInSchema = (userInput: userAuthType): string[] => {
    const errors: string[] = [];
    if (!isEmail(userInput.email)) {
        errors.push('Email Invalid!');
    }
    if (isEmpty(userInput.password) || !isLength(userInput.password, {min: 5})) {
        errors.push('Password is too short');
    }
    return errors;
};

export const createUser = async (parent, {userInput}: { userInput: userSignupType }, context, info) => {
    const errors = checkUserCreateSchema(userInput);
    if (errors.length > 0) {
        const error = new Error('Invalid Input.') as any;
        error.data = errors;
        error.code = 422;
        throw error;
    }
    const existingUser = await (await mongoDbPromise).usersCollection.findOne({email: userInput.email});
    if (existingUser) {
        throw new Error('User Exists Already');
    }
    let hashedPass: string;
    try {
        hashedPass = await crypt.cryptPassword(userInput.password);
    } catch {
        throw new Error('Error with Password Encryption!');
    }
    const user = new User(userInput.email, hashedPass, userInput.name);
    try {
        const result = await (await mongoDbPromise).usersCollection.insertOne(user);
        return {
            _id: result.insertedId,
            ...user
        };
    } catch (e) {
        logError(e);
        throw new Error('Bad Connection To Database');
    }
};

export const login = async (parent, args: userAuthType, context, info) => {
    const errors = checkUserSignInSchema({password: args.password, email: args.email});
    if (errors.length > 0) {
        const error = new Error('Invalid Input.') as any;
        error.data = errors;
        error.code = 422;
        throw error;
    }
    const user = await (await mongoDbPromise).usersCollection.findOne({email: args.email});
    if (!user) {
        throw new Error('EMAIL_NOT_FOUND');
    }
    const userPassword = args.password;
    const validPass = await crypt.compare(userPassword, user.password);
    if (!validPass) {
        throw new Error('INVALID_PASSWORD');
    }
    const userId = user._id.toHexString();
    return {
        token: jwt.sign({userId, email: user.email, name: user.name}, process.env.jwtKey, {expiresIn: '30m'}),
        userId,
        email: args.email,
        expiresIn: 1800000
    };
};

export const verifyUser = async (parent, {token}, context, info) => {
    const validated = verifyTokenGQLMidWare(token);
    if (!validated.authenticated) {
        return {
            success: false,
            message: validated.message
        };
    }
    const userId = validated.userId;
    try {
        const user = await (await mongoDbPromise).usersCollection.findOne({_id: userId});
        if (user) {
            return {
                success: true,
                email: user.email,
                userId: user._id.toHexString()
            };
        }
        return {success: false, message: 'BAD_REQUEST'};
    } catch (e) {
        logError(e);
        return {
            success: false,
            message: e.message
        };
    }
};

export const userStatus = async (parent, args, {authenticated, userId}, info) => {
    if (!authenticated) {
        const error = new Error('NOT_AUTHORIZED') as any;
        error.code = 401;
        throw error;
    }
    try {
        const {status} = await (await (mongoDbPromise)).usersCollection.findOne({_id: userId}, {projection: {status: true, _id: false}});
        if (!status) {
            return {
                status: null
            };
        }
        return {
            status
        };
    } catch (e) {
        throw new Error(e.message);
    }
};
