import * as fs from 'fs';

export const deleteImage = (imagePath: string) => {
    fs.promises.unlink(imagePath).then(() => {
    });
};
