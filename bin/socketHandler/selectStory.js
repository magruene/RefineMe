function selectStory(io, userSession, db, data) {
    let rooms = db.collection('rooms');
    rooms.find({'room_name': userSession.room_name}).limit(1).next((err, room) => {
        let activeStory;
        for(let i=0; i < room.stories.length; i++) {
            if (room.stories[i].name === data) {
                room.stories[i].active = true;
                activeStory = room.stories[i];
            } else {
                room.stories[i].active = false;
            }
        }

        rooms.updateOne({room_name: room.room_name}, {
            $set: {
                stories: room.stories
            }
        }, () => {
            io.to(userSession.room_name).emit('alert', "Session admin has selected new story. Now active: " + activeStory.name);
            io.to(userSession.room_name).emit('selectedStory', room);
        });

    });
}

module.exports = selectStory;