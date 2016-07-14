function roomConnection(io, socket, repo, data) {
    console.log(data);
    var userSession = {
        room_name: data.room_name,
        user_name: data.user_name,
        socket: socket
    };
    socket.join(userSession.room_name);

    repo.find({
        'room_name': userSession.room_name
    }, function (err, room) {
        if (err) throw err;

        socket.emit('prepare-room-screen', room);
        io.to(userSession.room_name).emit('update-view', room);

        var createStory = require("./createStory.js");
        socket.on('create_story', function (data) {
            createStory(io, userSession, repo, data);
        });

        let acceptStory = require("./acceptStory.js");
        socket.on('accept_story', function (data) {
            acceptStory(io, userSession, repo, data);
        });

        let selectStory = require("./selectStory.js");
        socket.on('select_story', function (data) {
            selectStory(io, userSession, repo, data);
        });

        var endStory = require("./endStory.js");
        socket.on('finish_story', function () {
            endStory(io, userSession, repo);
        });
    })
}

module.exports = roomConnection;