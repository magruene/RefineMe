function selectStory(roomName, repo, data, callback) {
    
    repo.find({'room_name': roomName}, (err, room) => {
        if (err) throw err;

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
            (err) => {
                if (err) throw err;
                callback(room, activeStory)
            });
    });
}

module.exports = selectStory;