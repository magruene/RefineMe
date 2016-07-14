function endStory(io, userSession, repo) {
    let finishedStory;
    repo.find({'room_name': userSession.room_name}, (err, room) => {
        if (err) throw err;

        for (let i = 0; i < room.stories.length; i++) {
            let story = room.stories[i];
            if (story.active) {
                story.finished = true;
                finishedStory = story;
                repo.update({room_name: room.room_name},
                    {stories: room.stories},
                    () => {
                        io.to(userSession.room_name).emit('storyFinished', finishedStory);
                    });
            }
        }
    });
}

module.exports = endStory;