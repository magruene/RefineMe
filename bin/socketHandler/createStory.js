function createStory(io, userSession, db, name) {
    let newStory = {
        name: name,
        estimates: []
    };
    let rooms = db.collection('rooms');
    rooms.find({'room_name': userSession.room_name}).limit(1).next((err, room) => {
        if (err) throw err;

        if (room.stories === undefined) {
            room.stories = [newStory];
        } else {
            room.stories.push(newStory);
        }
        rooms.updateOne({room_name: room.room_name}, {
            $set: {
                stories: room.stories
            }
        }, () => {
            io.to(userSession.room_name).emit('alert', "A new story '" + name + "' has been created!");
            io.to(userSession.room_name).emit('update-view', room);
        });
    });
}

module.exports = createStory;