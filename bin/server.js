#!/usr/bin/env node

/**
 * Module dependencies.
 */

let app = require('../app');
let debug = require('debug')('RefineMe:server');
let http = require('http');
let Repository = require('./Repository').Repository;

let joinRoom = require('./socketHandler/joinRoom.js');
let createRoom = require('./socketHandler/createRoom.js');
let roomConnection = require('./socketHandler/roomConnection.js');
let leaveRoom = require('./socketHandler/leaveRoom.js');

/**
 * DEV only
 */
require('dotenv').load();

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || '5000');

app.set('port', port);
/**
 * Create HTTP server.
 */

let server = http.createServer(app);
let io = require('socket.io')(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, function () {
    console.log('Express server listening on port ' + port)
});
server.on('error', onError);
server.on('listening', onListening);

let MONGO_USER = process.env.MONGO_USER || 'admin',
    MONGO_PW = process.env.MONGO_PW || 'admin',
    MONGO_BASE_URL = process.env.MONGO_BASE_URL || 'ds019478.mlab.com:19478/refineme';

let repo = new Repository('mongodb://' + MONGO_USER + ':' + MONGO_PW + '@' + MONGO_BASE_URL, 'rooms');

io.on('connection', function (socket) {
    let userName;
    console.log('a user connected');

    socket.on('join_room', data => joinRoom(repo, data,
        (eventName, value) => {
            socket.emit(eventName, value);
        }));

    socket.on('create_room', data => createRoom(repo, data,
        (eventName, value) => {
            socket.emit(eventName, value);
        }));

    socket.on('room-connection', data => roomConnection(io, socket, repo, data));

    socket.on('leave_room', data => leaveRoom(repo, data,
        (eventName, value, room) => {
            socket.emit(eventName, value);
            socket.broadcast.to(data.room_name).emit('update-table', room);
        }));

    socket.on('disconnect', () => console.log('user ' + userName + ' disconnected'));
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
