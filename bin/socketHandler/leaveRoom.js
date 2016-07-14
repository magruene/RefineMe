function leaveRoom(socket, repo, data) {

    repo.find({'room_name': data.room_name}, (err, room) => {
        if (err) throw err;

        let index = room.users.indexOf(data.user_name);
        if (index > -1) {
            room.users.splice(index, 1);
        }

        repo.update({room_name: room.room_name},
            {users: room.users},
            () => {
                socket.emit('redirect', 'login');
                socket.broadcast.to(data.room_name).emit('update-view', room);
            });
    });
    console.log('user disconnected');
}

module.exports = leaveRoom;