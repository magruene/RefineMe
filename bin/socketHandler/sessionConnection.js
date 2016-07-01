function sessionConnection(io, socket, db, data) {
    console.log(data);
    var userSession = {
        token: data.token,
        user_name: data.user_name,
        socket: socket
    };
    socket.join(userSession.token);
    var sessions = db.collection('sessions');

    sessions.find({
        'token': userSession.token
    }).toArray(function (err, res) {
        if (err) throw err;

        var session = res[0];

        socket.emit('prepare-session-screen', session);
        io.to(userSession.token).emit('update-view', session);

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

module.exports = sessionConnection;