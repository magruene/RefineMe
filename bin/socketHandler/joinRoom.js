let _ = require('lodash');

function joinRoom(socket, db, data) {
    let room_name = data.room_name,
        user_name = data.user_name;

    // check for empty fields
    if (user_name === '' || room_name === '') {
        socket.emit('alert', 'Whoops, you missed one!');
        return;
    }

    // create a database variable
    let rooms = db.collection('rooms');

    // create a variable to hold the data object
    rooms.find({'room_name': room_name}).limit(1).next((err, room) => {
        if (err) throw err;
        if (room) {
            if (!_.contains(room.users, user_name)) {
                room.users.push(user_name);
                rooms.updateOne({room_name: room_name}, {
                    $set: {
                        users: room.users
                    }
                }, () => {
                    socket.emit('store_room_name', room.room_name);
                    socket.emit('redirect', 'room');
                });
            } else {
                socket.emit('alert', 'User: ' + user_name + ' already in use for room: ' + room_name);
            }
        } else {
            socket.emit('alert', 'Could not find room with name ' + room_name);
        }
    });
}

module.exports = joinRoom;