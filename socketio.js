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
          name: 'Bezimienny${connections}',
          room: 'Poczekalnia',
          id: socket.id
      };
     
      users[user.name] = user;
      connected[socket.id] = users[user.name];
      
      io.local.emit('message', 'użytkownik ${user.name} poł')
      
      socket.join(user.room, () => {
          console.log(['użytkownik dołączył do pokoju ${user.name}']);
          io.local.emit('message', 'użytkownik dołączył do pokoju ${user.name}')
      })
  
  });
};