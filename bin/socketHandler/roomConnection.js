function roomConnection(io, socket, db, data) {
    console.log(data);
    var userSession = {
        room_name: data.room_name,
        user_name: data.user_name,
        socket: socket
    };
    socket.join(userSession.room_name);
    var rooms = db.collection('rooms');

    rooms.find({
        'room_name': userSession.room_name
    }).toArray(function (err, res) {
        if (err) throw err;

        var room = res[0];

        socket.emit('prepare-room-screen', room);
        io.to(userSession.room_name).emit('update-view', room);

        var createEstimation = require("./createEstimation.js");
        socket.on('create-estimation', function (data) {
            createEstimation(io, userSession, db, data);
        });

        var acceptEstimation = require("./acceptEstimation.js");
        socket.on('accept-estimation', function (data) {
            acceptEstimation(io, userSession, db, data);
        });

        var selectEstimation = require("./selectEstimation.js");
        socket.on('select-estimation', function (data) {
            selectEstimation(io, userSession, db, data);
        });

        var endEstimation = require("./endEstimation.js");
        socket.on('finish-estimation', function () {
            endEstimation(io, userSession, db);
        });
    })
}

module.exports = roomConnection;