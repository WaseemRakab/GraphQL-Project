import {Server} from 'http';
import * as socketIO from 'socket.io';

let io: socketIO.Server;

export const initSocketIO = (server: Server): void => {
    io = socketIO(server);
};


export const getIO = (): socketIO.Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
