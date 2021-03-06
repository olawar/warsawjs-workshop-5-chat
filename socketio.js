/**
 * Created by Awar on 2017-04-23.
 */
const socketio = require('socket.io');
const { DEFAULT_NAME, DEFAULT_ROOM, EVENTS } = require('./constans');
const { logUserMessage } = require('./db/api');
const { login, register, verifyToken } = require('./authenticate');


module.exports = server => {
    const io = socketio(server);
    // for simplicity
    let connections = 0;
    const connected = {};
    const users = {};
    const rooms = [DEFAULT_ROOM];
    
    io.on(EVENTS.CONNECTION, socket => {
        console.log(['io.on'], EVENTS.CONNECTION, socket.id);
        const user = {
            id: socket.id,
            room: DEFAULT_ROOM,
            name: `${DEFAULT_NAME}${connections}`,
            logged: false
        };
        
        // add user to connected users and create mapping for accessing users info by name and socket id
        connections++;
        connected[socket.id] = users[user.name];
        users[user.name] = user;
        
        //helpers functions
        const changeUserName = (name) => {
            const oldName = user.name;
            
            user.name = name;
            users[name] = user;
            
            delete users[oldName];
            
            socket.emit(EVENTS.USER, user.name);
            io.local.emit(EVENTS.USERS, Object.keys(users));
            io.local.emit(EVENTS.MESSAGE, `Użytkownik ${oldName} zmienił nazwę na: '${name}'`);
        };
        
        // event handlers
        const onDisconnect = () => {
            console.log(['io.on'], EVENTS.DISCONNECT, connected);
            io.clients((error, users) => {
                socket.broadcast.emit(EVENTS.MESSAGE, `Użytkownik ${user.name} rozłączył się`);
                socket.broadcast.emit(EVENTS.USERS, Object.keys(users));
            });
            
            delete connected[socket.id];
            delete users[user.name];
        };
        const onMessage = ({ message }) => {
            console.log(['socket.on'], EVENTS.MESSAGE, { message });
            logUserMessage(Object.assign({}, user, {message}));
            
            io.sockets.in(user.room).emit(EVENTS.MESSAGE, `${user.name}: ${message}`);
        };
        const onName = async ({ name }) => {
            console.log(['socket.on'], EVENTS.NAME, { name });
            if (users[name]) {
                socket.emit(EVENTS.MESSAGE, `Nazwa ${name} jest zajęta`);
                return null;
            }
            changeUserName(name);
            
            socket.emit(EVENTS.USER, user.name);
            io.local.emit(EVENTS.USERS, Object.keys(users));
        };
        const onPM = async ({ userName, message }) => {
            const userTo = users[userName];
            console.log(['socket.on'], EVENTS.PM, { userName, message });
            
            if (userTo) {
                socket.to(userTo.id).emit(EVENTS.PM, `Użytkownik ${user.name} wysłał Ci prywatną wiadomość o treści: ${message}`);
                socket.emit(EVENTS.PM, `Prywatna wiadomość do ${userName}: ${message}`);
            } else {
                socket.emit(EVENTS.PM, `Nie można wysłać wiadomości do użytkownika ${userName}`);
            }
        };
        const onRoom = async ({ room }) => {
            const oldRoom = user.room;
            console.log(['socket.on'], EVENTS.ROOM, { room });
            
            if (rooms.indexOf(room) < 0) {
                rooms.push(room);
                io.local.emit(EVENTS.ROOMS, rooms);
            }
            
            user.room = room;
            socket.leave(oldRoom, () => {
                socket.broadcast.to(oldRoom).emit(EVENTS.MESSAGE, `Użytkownik ${user.name} opuścił pokój`);
            });
            socket.join(room, () => {
                socket.broadcast.to(room).emit(EVENTS.MESSAGE, `Użytkownik ${user.name} dołączył do pokoju`);
                socket.emit(EVENTS.MESSAGE, `Zmieniłeś pokój na ${room}`);
                socket.emit(EVENTS.ROOM, room);
            });
        };
        const onLogin = async ({name, password}) => {
            console.log(['socket.on'], EVENTS.REGISTER, { name, password });
            const token = await login({name, password});
            if(token) {
                socket.emit(EVENTS.MESSAGE, `Logowanie przebiegło pomyślnie`);
                socket.emit(EVENTS.LOGGED, token);
                changeUserName(name);
                user.logged = true;
            } else {
                socket.emit(EVENTS.ERROR, `Logowanie nie powiodło się`);
            }
        };
        const onRegister = async ({name, password}) => {
            console.log(['socket.on'], EVENTS.REGISTER, { name, password });
            const token = await register({name, password});
            if(token) {
                socket.emit(EVENTS.MESSAGE, `Rejestracja przebiegła pomyślnie. Automatyczne logowanie`);
                socket.emit(EVENTS.LOGGED, token);
                changeUserName(name);
                user.logged = true;
            } else {
                socket.emit(EVENTS.ERROR, `Rejestracja nie powiodła się. Błąd: ${error}`);
            }
        };
        
        const preventLogged = (next) => (...args) => {
            if(user.logged) {
                socket.emit(EVENTS.MESSAGE, 'Operacja tylko dla niezalogowanych');
                return false;
            } else {
                next(...args);
            }
        };
        
        // join room and emit initial data
        socket.join(user.room, () => {
            socket.broadcast.emit(EVENTS.MESSAGE, `Użytkownik ${user.name} połączył się`);
            socket.emit(EVENTS.ROOM, user.room);
            socket.emit(EVENTS.ROOMS, rooms);
            socket.emit(EVENTS.USER, user.name);
            io.local.emit(EVENTS.USERS, Object.keys(users));
        });
        
        // handle sockets events
        socket.on(EVENTS.DISCONNECT, onDisconnect);
        socket.on(EVENTS.MESSAGE, onMessage);
        socket.on(EVENTS.NAME, onName);
        socket.on(EVENTS.PM, verifyToken(onPM, () => {
            socket.emit(EVENTS.MESSAGE, 'Operacja tylko dla zwerifikowanych użytkowników');
        }));
        socket.on(EVENTS.ROOM, onRoom);
        socket.on(EVENTS.LOGIN, preventLogged(onLogin));
        socket.on(EVENTS.REGISTER, preventLogged(onRegister));
    });
};