import {createUser, login, userStatus, verifyUser} from './controllers/auth/auth';
import {createPost, deletePost, editPost, post, posts} from './controllers/posts/posts';


export const resolvers = {
    Mutation: {
        createUser,
        createPost,
        editPost,
        deletePost
    },
    Query: {
        login,
        verifyUser,
        userStatus,
        posts,
        post,
    }
};

