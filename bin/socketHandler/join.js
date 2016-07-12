function join(socket, db, data) {
    var room_name = data.room_name,
        user_name = data.user_name,
        userName = user_name;

    // check for empty fields
    if (user_name === '' || room_name === '') {
        socket.emit('alert', 'Whoops, you missed one!');
        return;
    }

    // create a database variable
    var rooms = db.collection('rooms');

    // create a variable to hold the data object
    rooms.find().sort({_id: 1}).toArray(function (err, res) {
        if (err) throw err;

        var doesUserExist = function (room_name, res) {
            var exists;
            if (res.length) {
                for (var i = 0; i < res.length; i++) {
                    var room = res[i];
                    if (room_name === room.room_name) {
                        exists = true;
                        var room_users = room.users;
                        var knownUser = false;
                        for (var j = 0; j < room_users.length; j++) {
                            if (user_name === room_users[j]) {
                                knownUser = true;
                            }
                        }
                        if (!knownUser) {
                            room.users.push(user_name);
                            rooms.update({room_name: room_name}, {
                                $set: {
                                    users: room.users
                                }
                            });
                        }
                        socket.emit('store_room_name', room.room_name);
                        socket.emit('redirect', 'room');
                        break;
                    }
                }

                if (!exists) {
                    socket.emit('alert', 'Could not find session with given room name.')
                }
            } else {
                socket.emit('alert', 'Could not find session with given room name.')
            }
        };

        doesUserExist(room_name, res);
    });
}

module.exports = join;