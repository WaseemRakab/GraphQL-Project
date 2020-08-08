import * as express from 'express';
import * as imageController from '../controllers/imageController';
import * as multer from 'multer';
import {generateRandomFileName} from '../util/crypt';
import {Request} from 'express';

const router = express.Router();

router.post('/get-image', imageController.validateImagePath, imageController.postGetImage);

router.post('/get-image-url', imageController.postGetImageUrl);

const uploadImageMiddleware = multer(
    {
        storage: multer.diskStorage({
            destination: (req, file, callback) => {
                return callback(null, 'data/images');
            },
            filename: (req, file, callback) => {
                generateRandomFileName().then(token => {
                    return callback(null, token + '-' + file.originalname);
                }).catch(() => {
                    return callback(null, file.originalname);
                });
            }
        }), fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
            if (file.mimetype !== 'image/jpg' &&
                file.mimetype !== 'image/png' &&
                file.mimetype !== 'image/jpeg') {
                return callback(null, false);
            }
            return callback(null, true);
        },
        limits: {fileSize: 20971520}
    }
);

router.put('/put-image', uploadImageMiddleware.single('image'), imageController.putUploadImage);

export const imageRouter = router;
