import {Request, Response} from 'express';
import * as path from 'path';
import * as fs from 'fs';
import {body, validationResult} from 'express-validator';
import {rootDir} from '../util/rootDir';
import axios from 'axios';
import {generateRandomFileName} from '../util/crypt';
import {IncomingMessage} from 'http';

export const validateImagePath = body('image').custom(async (imagePath, {req}) => {
    const imagePathU = unescape(imagePath);
    if (!imagePath) {
        throw new Error('Invalid Request !');
    }
    try {
        const imageAbsPath = path.join(rootDir(), imagePathU);
        const stats = await fs.promises.stat(imageAbsPath);
        if (stats.isFile()) {
            req.body.imagePath = imageAbsPath;
            return true;
        }
        return Promise.reject('Image Not Found, Or Bad Request !');
    } catch (e) {
        throw new Error('Image Not found');
    }
});

export const postGetImage = (req: Request, res: Response) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: validationErrors.array().map(error => error.msg)
        });
    }
    const imagePath = req.body.imagePath;

    return res.download(imagePath);
};

export const postGetImageUrl = (req: Request, res: Response) => {
    const imageUrl = req.body.imageUrl;
    axios.get(imageUrl, {responseType: 'stream'}).then(async (response) => {
        if (response.data instanceof IncomingMessage) {
            const contentType = response.headers['content-type'];
            if (!contentType.startsWith('image')) {
                return res.status(400).json({success: false});
            }
            const type = contentType.split('/')[1];
            const stream = fs.createWriteStream(path.join(rootDir(), `${await generateRandomFileName()}.${type}`));
            response.data.pipe(stream);
            stream.on('finish', () => {
                stream.close();
                res.status(200).download(stream.path as string, () => {
                    fs.unlink(stream.path as string, () => {
                    });
                });
            });
            return;
        }
        res.status(400).json({success: false});
    }).catch((err) => {
        console.error(err);
        res.status(400).json({success: false});
    });
    /*https.get(imageUrl, async (response: IncomingMessage) => {
        try {
            const contentType = response.headers['content-type'];
            if (!contentType.startsWith('image')) {
                return res.status(400).json({success: false});
            }
            const type = contentType.split('/')[1];
            const stream = fs.createWriteStream(path.join(rootDir(), `${await generateRandomFileName()}.${type}`));
            response.pipe(stream);
            stream.on('finish', () => {
                stream.close();
                res.status(200).download(stream.path as string, () => {
                    fs.unlink(stream.path as string, () => {
                    });
                });
            });
        } catch (e) {
            res.status(400).json({success: false});
        }
    });*/
};

export const putUploadImage = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(200).json({message: 'No File Provided!'});
    }
    return res.status(201).json({message: 'File Stored!', imagePath: escape(req.file.path)});
};
