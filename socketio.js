/**
 * Created by Awar on 2017-04-23.
 */
const socketio = require('socket.io');

module.exports = (server) => {
  const io = socketio(server);
  console.log(['socketio.js'], server);
  
  io.on('connection', socket => {
      console.log(['connection'], socket.id);
  });
};