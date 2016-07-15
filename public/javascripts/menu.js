import {el, childEl} from './utils';

let addButton = el('#add-button');
let storyNameInput = el('#storyName');
let storyNameLabel = el('#storyNameLabel');

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
            let availableStories = el('#availableStories');
            availableStories.innerHTML = '';

            for (let story of room.stories) {
                let storyElement = document.createElement('li');
                let buttonElement = document.createElement('a');

                buttonElement.textContent = story.name;
                buttonElement.classList = 'waves-effect waves-teal';
                buttonElement.addEventListener('click', (event) => {
                    let elements = childEl(availableStories, 'li');
                    if( Object.prototype.toString.call( elements ) === '[object Array]') {
                        for (let storyElement1 of elements) {
                            storyElement1.classList = 'bold';
                        }
                    } else {
                        elements.classList = 'bold';
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