/**
 * Created by Awar on 2017-04-23.
 */
const http = require('http');
const express = require('express');
const { resolve } = require('path');

const app = express();
const server = http.Server(app);
const PORT = process.env.PORT || "30001";

require('./socketio')(server);

app.get('/', (req, res) => res.sendFile(resolve(__dirname, './index.html')));
server.listen(PORT, () => console.log('listening on port ', PORT));
