function createStory(roomName, repo, storyName, callback) {

    let newStory = {
        name: storyName,
        estimates: []
    };

    repo.find({'room_name': roomName}, (err, room) => {
        if (err) throw err;

        if (room.stories === undefined) {
            room.stories = [newStory];
        } else {
            room.stories.push(newStory);
            room.stories.push(newStory);
        }

        repo.update({room_name: room.room_name},
            {stories: room.stories},
            (err) => {
                if (err) throw err;
                callback(room)
            }
        );
    });
}

module.exports = createStory;