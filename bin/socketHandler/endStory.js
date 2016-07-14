function endStory(roomName, repo, callback) {
    
    let finishedStory;
    repo.find({'room_name': roomName}, (err, room) => {
        if (err) throw err;

        for (let i = 0; i < room.stories.length; i++) {
            let story = room.stories[i];
            if (story.active) {
                story.finished = true;
                finishedStory = story;
                repo.update({room_name: room.room_name},
                    {stories: room.stories},
                    (err) => {
                        if (err) throw err;
                        callback(finishedStory)
                    });
            }
        }
    });
}

module.exports = endStory;