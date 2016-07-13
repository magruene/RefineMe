function leaveRoom(socket, db, data) {
    let rooms = db.collection('rooms');

    rooms.find({'room_name' : data.room_name}).limit(1).next((err, room) => {
        if (err) throw err;

        let index = room.users.indexOf(data.user_name);
        if (index > -1) {
            room.users.splice(index, 1);
        }

        rooms.updateOne({room_name: room.room_name}, {
            $set: {
                users: room.users
            }
        }, () => {
            socket.emit('redirect', 'login');
            socket.broadcast.to(data.room_name).emit('update-view', room);
        });
    });
    console.log('user disconnected');
}

module.exports = leaveRoom;