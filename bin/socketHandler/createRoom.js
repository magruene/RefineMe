function createRoom(socket, db, data) {
    var user_name = data.user_name;

    if (user_name === '') {
        socket.emit('alert', 'Please give me your name so I may use it for personalized advertisement');
    } else {
        var rooms = db.collection('rooms');
        var newRoomName = generateRoomName();
        rooms.insert({
            room_name: newRoomName,
            leader: user_name,
            users: [user_name]
        }, function () {
            // after inserting new session to db, redirect to session
            socket.emit('store_room_name', newRoomName);
            socket.emit('redirect', 'room');
        });
    }
}


function generateRoomName() {
    return Math.random().toString(36).substr(2); // remove `0.`
}

module.exports = createRoom;