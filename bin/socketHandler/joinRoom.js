let _ = require('lodash');

function joinRoom(socket, repo, data) {
    let room_name = data.room_name,
        user_name = data.user_name;

    // check for empty fields
    if (user_name === '' || room_name === '') {
        socket.emit('alert', 'Whoops, you missed one!');
        return;
    }

    // create a variable to hold the data object
    repo.find({'room_name': room_name}, (err, room) => {
        if (err) throw err;
        if (room) {

            if (!_.find(room.users, user_name)) {
                room.users.push(user_name);
                repo.update({room_name: room_name},
                    {users: room.users},
                    () => {
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