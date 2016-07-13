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

        var createStory = require("./createStory.js");
        socket.on('create_story', function (data) {
            createStory(io, userSession, db, data);
        });

        let acceptStory = require("./acceptStory.js");
        socket.on('accept_story', function (data) {
            acceptStory(io, userSession, db, data);
        });

        let selectStory = require("./selectStory.js");
        socket.on('select_story', function (data) {
            selectStory(io, userSession, db, data);
        });

        var endStory = require("./endStory.js");
        socket.on('finish_story', function () {
            endStory(io, userSession, db);
        });
    })
}

module.exports = roomConnection;