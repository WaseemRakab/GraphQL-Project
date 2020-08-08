import {mongoDbPromise} from '../../../util/database';
import {ObjectID} from 'mongodb';
import validator from 'validator';
import {Post} from '../../../models/post';
import {getIO} from '../../../socket';
import {deleteImage} from '../../../util/imageHandler';
import {logError} from '../../../util/logErrors';
import isMongoId = validator.isMongoId;
import isEmpty = validator.isEmpty;
import isLength = validator.isLength;


type postsPagination = { pageIndex: number, pageSize: number };
type postID = { postID: string };
type postInputData = { postInput: { title: string, content: string, image: string, createdDate?: string } };
type postEditInputData = { postEditInput: postInputData & { postId: string } };
type postDeleteInputData = { postId: string };

const validatePostSchema = ({postInput}: postInputData): string[] => {
    const errors: string[] = [];
    if (isEmpty(postInput.title)) {
        errors.push('Title must not be empty');
    }
    if (!isLength(postInput.title, {min: 3})) {
        errors.push('Title must have at least 3 characters!');
    }
    if (isEmpty(postInput.content)) {
        errors.push('Content must not be empty');
    }
    if (!isLength(postInput.content, {min: 8})) {
        errors.push('Post Content must contain at least 8 characters');
    }
    return errors;
};

export const posts = async (parent, args: postsPagination, {authenticated}) => {
    if (!authenticated) {
        const error = new Error('NOT_AUTHORIZED') as any;
        error.code = 401;
        throw error;
    }
    try {
        const dataService = await mongoDbPromise;
        const length = +await dataService.postsCollection.countDocuments();
        const postsList = await dataService.postsCollection.find()
            .sort({createdDate: -1})
            .skip(args.pageIndex * args.pageSize)
            .limit(args.pageSize)
            .toArray();
        return {
            posts: postsList,
            length
        };
    } catch (e) {
        logError(e);
        throw new Error(e.message);
    }
};

export const post = async (parent, args: postID, {authenticated}) => {
    if (!authenticated) {
        const error = new Error('NOT_AUTHORIZED') as any;
        error.code = 401;
        throw error;
    }
    if (!isMongoId(args.postID)) {
        const error = new Error('BAD ID') as any;
        error.code = 400;
        throw error;
    }
    try {
        const postId = new ObjectID(args.postID);
        const mongoDb = await mongoDbPromise;
        const postResult = await mongoDb.postsCollection.findOne({_id: postId});
        if (!postResult) {
            return {
                success: false,
                post: null
            };
        }
        return {
            success: true,
            post: postResult
        };
    } catch (e) {
        logError(e);
        throw new Error(e.message);
    }
};

export const createPost = async (parent, args: postInputData, {authenticated, userId, name}) => {
    if (!authenticated) {
        const error = new Error('NOT_AUTHORIZED') as any;
        error.code = 401;
        throw error;
    }
    const errors = validatePostSchema(args);
    if (errors.length > 0) {
        const error = new Error('Invalid Input.') as any;
        error.data = errors;
        error.code = 422;
        throw error;
    }
    const createdDate = new Date().toISOString();
    const postInput = args.postInput;
    const newPost: Post = {
        title: postInput.title,
        createdDate,
        userId,
        updatedDate: createdDate,
        content: postInput.content,
        image: postInput.image as string,
        creatorName: name
    };
    try {
        const db = await mongoDbPromise;
        const postResult = await db.postsCollection.insertOne(newPost);
        newPost._id = postResult.insertedId;
        getIO().emit('postsChanged', {action: 'Create', post: newPost});
        return {
            post: newPost,
            success: true
        };
    } catch (e) {
        logError(e);
        throw new Error(e.message);
    }
};


const validatePostWithAuth = async (postId: ObjectID, userId: ObjectID) => {
    try {
        const postResult = await (await mongoDbPromise).postsCollection.findOne({_id: postId});
        if (!postResult) {
            return {
                success: false,
                message: 'Post not Exists in the system!'
            };
        }
        if (!postResult.userId.equals(userId)) {
            return {
                success: false,
                message: 'You are not authorized to modify this post !'
            };
        }
        return {success: true, prevImage: unescape(postResult.image), message: 'Verified'};
    } catch (e) {
        logError(e);
        return {
            success: false,
            message: 'Bad Connection to Database!'
        };
    }
};

export const editPost = async (parent, args: postEditInputData, {authenticated, userId, name}) => {
    if (!authenticated) {
        const error = new Error('NOT_AUTHORIZED') as any;
        error.code = 401;
        throw error;
    }
    const errors = validatePostSchema(args.postEditInput);
    if (errors.length > 0) {
        const error = new Error('Invalid Input.') as any;
        error.data = errors;
        error.code = 422;
        throw error;
    }
    const userID = new ObjectID(userId);
    const postId = new ObjectID(args.postEditInput.postId);
    const validatePostResult = await validatePostWithAuth(postId, userID);
    if (!validatePostResult.success) {
        throw new Error(validatePostResult.message);
    }
    try {
        if (unescape(args.postEditInput.postInput.image) !== validatePostResult.prevImage) {
            deleteImage(validatePostResult.prevImage);
        }
        const db = await mongoDbPromise;
        const updatedPost: Post = {
            creatorName: name,
            userId,
            _id: postId,
            title: args.postEditInput.postInput.title,
            image: args.postEditInput.postInput.image,
            createdDate: args.postEditInput.postInput.createdDate,
            updatedDate: new Date().toISOString(),
            content: args.postEditInput.postInput.content
        };
        const postEditResult = await db.postsCollection.replaceOne({_id: postId}, updatedPost);
        getIO().emit('postsChanged', {action: 'Edit', post: updatedPost, postId: postId.toHexString()});
        return {
            success: postEditResult.modifiedCount > 0,
            post: updatedPost
        };
    } catch (e) {
        logError(e);
        return {
            success: false,
            message: 'Editing post failed, try again later.'
        };
    }
};

export const deletePost = async (parent, args: postDeleteInputData, {authenticated, userId}) => {
    if (!authenticated) {
        const error = new Error('NOT_AUTHORIZED') as any;
        error.code = 401;
        throw error;
    }
    const userID = new ObjectID(userId);
    const postId = new ObjectID(args.postId);
    const validatePostResult = await validatePostWithAuth(postId, userID);
    if (!validatePostResult.success) {
        const error = new Error(validatePostResult.message);
        logError(error);
        throw error;
    }
    try {
        const db = await mongoDbPromise;
        const deleteResult = await db.postsCollection.deleteOne({_id: postId});
        if (deleteResult.deletedCount > 0) {
            deleteImage(validatePostResult.prevImage);
            getIO().emit('postsChanged', {action: 'Delete', postId: postId.toHexString()});
            return {
                success: true
            };
        }
        return {
            success: false
        };
    } catch (e) {
        logError(e);
        throw new Error(e.message);
    }
};
