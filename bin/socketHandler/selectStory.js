function selectStory(io, userSession, repo, data) {
    repo.find({'room_name': userSession.room_name}, (err, room) => {
        let activeStory;
        for (let i = 0; i < room.stories.length; i++) {
            if (room.stories[i].name === data) {
                room.stories[i].active = true;
                activeStory = room.stories[i];
            } else {
                room.stories[i].active = false;
            }
        }

        repo.update({room_name: room.room_name},
            {stories: room.stories},
            () => {
                io.to(userSession.room_name).emit('alert', "Session admin has selected new story. Now active: " + activeStory.name);
                io.to(userSession.room_name).emit('selectedStory', room);
            });

    });
}

module.exports = selectStory;