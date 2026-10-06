import { io } from 'socket.io-client';

const URL = window.location.origin.includes('localhost:5173')
    ? 'http://localhost:3001'
    : window.location.origin;

export const socket = io(URL, {
    autoConnect: false,
});
