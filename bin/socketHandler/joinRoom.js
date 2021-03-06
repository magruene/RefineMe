let _ = require('lodash');

function joinRoom(repo, data, callback) {
    
    let room_name = data.room_name,
        user_name = data.user_name;

    // check for empty fields
    if (user_name === '' || room_name === '') {
        callback('alert', 'Whoops, you missed one!');
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
                    (err) => {
                        if(err) throw err;
                        callback('store_room_name', room.room_name);
                        callback('redirect', 'room');
                    });
            } else {
                callback('alert', 'User: ' + user_name + ' already in use for room: ' + room_name);
            }
        } else {
            callback('alert', 'Could not find room with name ' + room_name);
        }
    });
}

module.exports = joinRoom;