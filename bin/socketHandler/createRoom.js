function createRoom(socket, repo, data) {
    let user_name = data.user_name;

    if (user_name === '') {
        socket.emit('alert', 'Please give me your name so I may use it for personalized advertisement');
    } else {
        let newRoomName = generateRoomName();
        repo.add({
            room_name: newRoomName,
            creator: user_name,
            users: [user_name]
        }, (err) => {
            if(err) throw err;
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