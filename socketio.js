/**
 * Created by Awar on 2017-04-23.
 */
const socketio = require('socket.io');

module.exports = (server) => {
  const io = socketio(server);
  let connections = 0;
  const connected = {};
  const users = {};
  const rooms = ['Poczekalnia'];
  
  io.on('connection', socket => {
      console.log(['connection'], socket.id);
      connections ++;
      const user = {
          name: `Bezimienny${connections}`,
          room: 'Poczekalnia',
          id: socket.id
      };
     
      users[user.name] = user;
      connected[socket.id] = users[user.name];
      
      io.local.emit('message', `użytkownik ${user.name} połączył się`);
      socket.emit('rooms', rooms);                
      
      socket.join(user.room, () => {
          console.log(`użytkownik ${user.name} dołączył do pokoju`);
          socket.broadcast.emit('message', `użytkownik ${user.name} dołączył do pokoju`);
      });
      
      socket.on('message', ({message}) => {
          console.log('socket.on.message', message);
          io.sockets.in(user.room).emit('message', `${user.name} : ${message}`);
      });
      
      socket.on('room', ({ room }) => {
          console.log('socket.on.room', room);
          const oldRoom = user.room;
          user.room = room;
          
          if(!rooms.includes(room)) {
              rooms.push(room);
              io.local.emit('rooms', rooms);
          }
          
          socket.leave(oldRoom, () => {
              socket.broadcast.to(oldRoom).emit('message', `Użytkownik ${user.name} opuścił pokój`);
          });
          
          socket.join(user.room, () => {
              socket.broadcast.to(room).emit('message', `Użytkownik ${user.name} dołączył do pokoju`);
              socket.emit('message', `Zmieniłeś pokój na ${user.room}`);
          });
      });
      
      socket.on('disconnect', () => {
         console.log('socket.on.disconnect', user);
         delete connected[socket.id];
         delete users[user.name];
         socket.broadcast.emit('message', `użytkownik ${user.name} rozłączył się`);
      });                 
  
  });
};