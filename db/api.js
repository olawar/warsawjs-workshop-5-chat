/**
 * Created by Awar on 2017-04-23.
 */
const sqlite = require('sqlite');

const logUserMessage = async ({ name, room, message }) => {
    console.log(['api.logUserMessage'], { name, room, message });
    const db = await sqlite.open('chat.db');
    const time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    
    await db.run(`INSERT into messages(user, message, room, timestamp) VALUES ('${name}', '${message}', '${room}','${time}')`);
    const messages = await db.all('SELECT * FROM messages');
};

module.exports = {
    logUserMessage,
};