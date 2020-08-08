import {NextFunction, Request, Response} from 'express';
import * as jwt from 'jsonwebtoken';
import {ObjectID} from 'mongodb';

export const verifyTokenGQLMidWare = (token: string) => {
    if (!token) {
        return {token: null};
    }
    try {
        const jwtToken = token.split(' ')[1];
        const decoded = jwt.verify(jwtToken, process.env.jwtKey) as { userId: string, name: string };
        if (!decoded) {
            return {
                authenticated: false,
                message: 'TOKEN_EXPIRED'
            };
        }
        const userId = new ObjectID(decoded.userId);
        const name = decoded.name;
        return {authenticated: true, userId, name};
    } catch (error) {
        if (error.message === 'jwt expired') {
            return {
                authenticated: false,
                message: 'TOKEN_EXPIRED'
            };
        }
        return {token: null, message: 'INVALID_TOKEN'};
    }
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.get('Authorization');
        if (!token) {
            const error = new Error('Authorization Required !!');
            (error as any).statusCode = 403;
            return next(error);
        }
        const jwtToken = token.split(' ')[1] || null;
        const decoded: any = jwt.verify(jwtToken, process.env.jwtKey);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'TOKEN_EXPIRED'
            });
        }
        req.body.userId = new ObjectID(decoded.userId);
        req.body.name = decoded.name;
        next();
    } catch (error) {
        if (error.message === 'jwt expired') {
            return res.status(401).json({
                success: false,
                message: 'TOKEN_EXPIRED'
            });
        }
        throw (new Error(error.message));
    }
};
