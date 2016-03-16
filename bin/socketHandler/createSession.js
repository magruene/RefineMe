function createSession(socket, db, data) {
    var user_name = data.user_name;

    if (user_name === '') {
        socket.emit('alert', 'Please give me your name so I may use it for personalized advertisement');
    } else {
        var sessions = db.collection('sessions');
        var newToken = generateToken();
        sessions.insert({
            token: newToken,
            leader: user_name,
            users: [user_name]
        }, function () {
            // after inserting new session to db, redirect to session
            socket.emit('store_token', newToken);
            socket.emit('redirect', 'session');
        });
    }
}


function generateToken() {
    return Math.random().toString(36).substr(2); // remove `0.`
}

module.exports = createSession;