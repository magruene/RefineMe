import {el, childEl} from './utils';

let addButton = el('#add-button');

export function init(server, room) {
    addButton.addEventListener('click', (event) => {
        var storyNameInput = el('#storyName');
        let storyName = storyNameInput.value;
        server.emit('create_story', storyName);
        storyNameInput.value = '';
    });

    server.on('storyCreated', createStoryList);

    function createStoryList(room) {
        if (room.stories) {
            let availableStories = el('#availableStories');
            availableStories.innerHTML = '';

            for (let story of room.stories) {
                let storyElement = document.createElement('li');
                let buttonElement = document.createElement('a');

                buttonElement.textContent = story.name;
                buttonElement.classList = 'waves-effect waves-teal';
                buttonElement.addEventListener('click', (event) => {
                    for(let storyElement1 of childEl(availableStories, 'li')) {
                        storyElement1.classList = 'bold';
                    }
                    storyElement.classList = '';
                    storyElement.classList = 'bold active';
                });
                storyElement.classList = 'bold';
                storyElement.appendChild(buttonElement);
                availableStories.appendChild(storyElement);
            }
        }
    }

    createStoryList(room);
}