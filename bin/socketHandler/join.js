function join(socket, db, data) {
    var token = data.token,
        user_name = data.user_name,
        userName = user_name;

    // check for empty fields
    if (user_name === '' || token === '') {
        socket.emit('alert', 'Whoops, you missed one!');
        return;
    }

    // create a database variable
    var sessions = db.collection('sessions');

    // create a variable to hold the data object
    sessions.find().sort({_id: 1}).toArray(function (err, res) {
        if (err) throw err;

        var doesUserExist = function (token, res) {
            var exists;
            if (res.length) {
                for (var i = 0; i < res.length; i++) {
                    var session = res[i];
                    if (token === session.token) {
                        exists = true;
                        var session_users = session.users;
                        var knownUser = false;
                        for (var j = 0; j < session_users.length; j++) {
                            if (user_name === session_users[j]) {
                                knownUser = true;
                            }
                        }
                        if (!knownUser) {
                            session.users.push(user_name);
                            sessions.update({token: token}, {
                                $set: {
                                    users: session.users
                                }
                            });
                        }
                        socket.emit('store_token', session.token);
                        socket.emit('redirect', 'session');
                        break;
                    }
                }

                if (!exists) {
                    socket.emit('alert', 'Could not find session with given token.')
                }
            } else {
                socket.emit('alert', 'Could not find session with given token.')
            }
        };

        doesUserExist(token, res);
    });
}

module.exports = join;