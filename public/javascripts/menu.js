import {el, childEl} from './utils';

let addButton = el('#add-button')[0];
let storyNameInput = el('#storyName')[0];
let storyNameLabel = el('#storyNameLabel')[0];

export function init(server, room) {
    addButton.addEventListener('click', (event) => {
        let storyName = storyNameInput.value;
        if (storyName === '') {
            storyNameInput.className = 'invalid';
            storyNameLabel.className = 'active';
            return;
        }
        server.emit('create_story', storyName);
        storyNameInput.value = '';
    });

    storyNameInput.addEventListener('blur', (event) => {
        storyNameInput.className = '';
    });

    storyNameInput.addEventListener('keyup', (event) => {
        storyNameInput.className = 'valid';
    });

    server.on('storyCreated', createStoryList);

    function createStoryList(room) {
        if (room.stories) {
            let availableStories = el('#availableStories')[0];
            availableStories.innerHTML = '';

            for (let story of room.stories.reverse()) {
                let storyElement = document.createElement('li');
                let buttonElement = document.createElement('a');

                buttonElement.textContent = story.name;
                buttonElement.classList = 'waves-effect waves-teal';
                buttonElement.addEventListener('click', (event) => {
                    let elements = childEl(availableStories, 'li');
                    for (let storyElement1 of elements) {
                        storyElement1.classList = 'bold';
                    }
                    storyElement.classList = '';
                    storyElement.classList = 'bold active';

                    server.emit('select_story', event.target.textContent);
                });
                storyElement.classList = 'bold';
                storyElement.appendChild(buttonElement);
                availableStories.appendChild(storyElement);
            }
        }
    }

    createStoryList(room);
}