/**
 * Created by Awar on 2017-04-23.
 */
const socketio = require('socket.io');

module.exports = (server) => {
  const io = socketio(server);
  let connections = 0;
  const connected = {};
  const users = {};
  
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
      
      socket.join(user.room, () => {
          console.log('użytkownik dołączył do pokoju ${user.name}');
          socket.broadcast.emit('message', `użytkownik dołączył do pokoju ${user.name}`)
      });
      
      socket.on('message', ({message}) => {
          console.log('socket.on.message', message);
          io.local.emit('message', `${user.name} : ${message}`);
      });
      
      socket.on('disconnect', () => {
         delete connected[socket.id];
         delete users[user.name];
         console.log('socket.on.disconnect', user);
         socket.broadcast.emit('message', `użytkownik ${user.name} rozłączył się`);
      });
  
  });
};