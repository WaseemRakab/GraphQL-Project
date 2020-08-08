import {generateRandomFileName} from './crypt';
import * as fs from 'fs';
import * as path from 'path';
import {rootDir} from './rootDir';
import * as os from 'os';
import * as moment from 'moment';

const errorDirPath = path.join(rootDir(), 'data', 'errors');

const writeFile = (filePath: string, msg: string) => {
    fs.promises.writeFile(filePath, msg).catch(() => {
    });
};

export const logError = (error: Error) => {
    generateRandomFileName().then(fileName => {
        const filename = path.join
        (
            errorDirPath,
            `${fileName}.txt`
        );
        const currDate = moment(new Date()).format('dddd, MMMM Do YYYY,H:mm');
        const msg = `Log Date: ${currDate}
            ${os.EOL}code: ${error.name}
            ${os.EOL}message: ${error.message}${os.EOL}stack: ${error.stack}`;
        writeFile(filename, msg);
    }).catch((err) => {
        console.log(err);
    });
};
