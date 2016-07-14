function leaveRoom(repo, data, callback) {

    repo.find({'room_name': data.room_name}, (err, room) => {
        if (err) throw err;

        let index = room.users.indexOf(data.user_name);
        if (index > -1) {
            room.users.splice(index, 1);
        }

        repo.update({room_name: room.room_name},
            {users: room.users},
            (err) => {
                if(err) throw err;
                callback('redirect', 'login', room);
            });
    });
    console.log('user disconnected');
}

module.exports = leaveRoom;