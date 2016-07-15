import {el, childEl} from './utils';
let socketConnection,
    cardTemplate,
    session_username = sessionStorage.getItem('ss_user_name'),
    session_room_name = sessionStorage.getItem('ss_room_name');

export function init(givenSocketConnection) {
    socketConnection = givenSocketConnection;

    socketConnection.on('storyFinished', function (finishedStory) {
        completeEstimation(finishedStory);
    });

    socketConnection.on('update-table', function (room) {
        if (!cardTemplate) {
            $.ajax("/templates/card.html").success(function (card) {
                cardTemplate = card;
                updateCards(room);
            });
        } else {
            updateCards(room);
        }
    });
}

Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .reduce((res, key) => (res[key] = obj[key], res), {});

function completeEstimation(finishedStory) {
    finishedStory.estimates.forEach((estimate) => {
        let card = el('#card_' + escape(estimate.user));
        childEl(card, "#estimationDone").style.display = 'none';
        var storyText = childEl(card, "#storyText");
        storyText.innerHTML = estimate.estimation;
        storyText.style.display = 'block';
    });
}

function updateCards(room) {
    var userCards = el('#users >div');
    if (userCards !== null) {
        userCards.forEach(function (userElement) {
            if (!(userElement.getAttribute("id") === "card_" + escape(session_username))) {
                userElement.parentNode.removeChild(userElement);
            }
        });
    }

    $('.collapsible').collapsible();

    let activeStory;
    if (room.stories !== undefined && room.stories.length > 0) {
        activeStory = Object.filter(room.stories, story=> story.active);
    }
    let isCreator = room.creator === session_username;

    if (isCreator) {
        el(".endStoryButton")[0].addEventListener('click', function () {
            socketConnection.emit('finish_story');
        })
    }

    let sort = room.users;

    $.each(sort, function (index, user) {
        let isCurrentUser = user === session_username;
        let ownCardDoesNotYetExist = $("#card_" + escape(session_username)).length === 0;
        let card = cardTemplate.replace(new RegExp("{{user}}", "g"), escape(user));
        card = card.replace(new RegExp("{{actual_user}}", "g"), user);

        if (isCurrentUser && ownCardDoesNotYetExist) {
            $('#users').append(card);
            let $card = $('#card_' + escape(user));
            $card.addClass("active");
        } else if (!isCurrentUser) {
            $('#users').append(card);
        }
    });

    if (activeStory) {
        $.each(activeStory.estimates, function (index, estimate) {
            let user = estimate.user;
                        let $card = $('#card_' + user);

            if (user === session_username) {
                $($card.find("#storyText")).html(estimate.estimation);
            }

            newEstimateAdded(user);
        });
    }
}

function newEstimateAdded(userWhoAddedEstimate) {
    let $card = $('#card_' + userWhoAddedEstimate);
    $($card.find(".preloader-wrapper")).hide();
    if (userWhoAddedEstimate !== session_username) {
        $($card.find("#estimationDone i")).addClass("storyText-important")
    }
    $($card.find("#estimationDone")).show();
}

function escape(string) {
    return string.replace(/\s+/g, '_');
}