import * as crypto from 'crypto';

export const cryptPassword = (password: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const algorithm = 'aes256';
        crypto.scrypt(password, 'salt', 32, ((err, derivedKey) => {
            if (err) {
                return reject(err);
            }
            const iv = Buffer.alloc(16, process.env.ivK, 'base64');
            const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
            resolve(cipher.final('base64'));
        }));
    });
};

export const compare = (password: string, hashedPassword: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        cryptPassword(password).then(hashResult => {
            return resolve(hashResult === hashedPassword);
        }).catch(error => {
            reject(error);
        });
    });
};

export const generateToken = (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        crypto.randomBytes(32, ((err, buf) => {
            if (!err) {
                return resolve(buf.toString('hex'));
            }
            return reject(err.message);
        }));
    });
};

export const generateRandomFileName = (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        crypto.randomBytes(12, ((err, buf) => {
            if (!err) {
                return resolve(buf.toString('hex'));
            }
            return reject(err.message);
        }));
    });
};
