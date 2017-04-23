/**
 * Created by Awar on 2017-04-23.
 */
const DEFAULT_NAME = 'Bezimienny';
const DEFAULT_ROOM = 'Poczekalnia';
const EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    MESSAGE: 'message',
    ERROR: 'errors',
    USER: 'user',
    USERS: 'users',
    ROOM: 'room',
    ROOMS: 'rooms',
    NAME: 'name',
    PM: 'pm',
    LOGIN: 'login',
    REGISTER: 'register'
};

module.exports = {
    DEFAULT_ROOM,
    DEFAULT_NAME,
    EVENTS,
};