import {el} from './utils';
import * as header from './header';

(function (global, $) {

    function init() {
        header.init();
    }

    let session_username = sessionStorage.getItem('ss_user_name');
    let activeStory;
    let isCreator;
    let cardTemplate;
    let mobileMenuTemplate;
    let storyNumberTemplate;
    let server;
    // attempt connection to the server
    try {
        server = io.connect(global.location.host);
    } catch (e) {
        alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
    }

    // if the server connection is successful
    function appendInviteButton(room) {
        $.each($(".invite-url"), function (index, element) {
            let $element = $(element);
            $element.empty();
            $element.append("<input type='text' class='col hide m6' value='https://ancient-journey-65390.herokuapp.com/login?room_name=" + room.room_name + "' /><button class='waves-effect waves-light btn col'>Invite members</button>");
            $($element.find("button")).click(function () {
                let copyText = $($element.find("input"));
                copyText.removeClass("hide");
                copyText.focus();
                copyText.select();
                try {
                    if (document.execCommand('copy')) {
                        Materialize.toast("Successfully copied link to clipboard!", 4000, 'rounded');
                        copyText.addClass("hide");
                    }
                } catch (err) {
                    Materialize.toast("Wasn't able to copy link to clipboard, sorry.", 4000, 'rounded');
                }
            });
        });

    }

    function newEstimateAdded(userWhoAddedEstimate) {
        let $card = $('#card_' + userWhoAddedEstimate);
        $($card.find(".preloader-wrapper")).hide();
        if (userWhoAddedEstimate !== session_username) {
            $($card.find("#estimationDone i")).addClass("storyText-important")
        }
        $($card.find("#estimationDone")).show();
    }

    if (server !== undefined) {
        $('.leave_room').click(function (event) {
            server.emit('leave_room', {
                room_name: sessionStorage.getItem('ss_room_name'),
                user_name: sessionStorage.getItem('ss_user_name')
            });
            event.preventDefault;
        });

        server.emit('room-connection', {
            room_name: sessionStorage.getItem('ss_room_name'),
            user_name: sessionStorage.getItem('ss_user_name')
        });

        // alert error messages returned from the server
        server.on('alert', function (msg) {
            Materialize.toast(msg, 4000, 'rounded');
        });

        server.on('redirect', function (href) {
            window.location.assign(href);
        });

        server.on("storyFinished", function (finishedStory) {
            $.each(finishedStory.estimates, function (index, estimate) {
                let $card = $('#card_' + escape(estimate.user));
                $($card.find("#estimationDone")).hide();
                $($card.find("#storyText")).html(estimate.estimation);
                $($card.find("#storyText")).show();
            });
        });

        server.on('prepare-room-screen', function (room) {
            sessionStorage.setItem('ss_room', room);
            $("#room_name").text(room.room_name);
            $('#users').empty();
            isCreator = room.creator === sessionStorage.getItem('ss_user_name');
            if (isCreator) {
                $('.availableEstimationsDropdown').removeClass("hide");
                $(".modal-action").click(function () {
                    let estimationName = $("input[name='estimationName']").val();
                    server.emit('create_story', estimationName);
                });
            }
        });

        server.on("selectedStory", function (room) {
            updateView(room);
        });

        server.on('update-view', function (room) {
            if (!cardTemplate && !mobileMenuTemplate) {
                $.ajax("/templates/card.html").success(function (card) {
                    $.ajax("/templates/mobileMenu.html").success(function (mobileMenu) {
                        cardTemplate = card;
                        mobileMenuTemplate = mobileMenu;
                        updateView(room);
                    });
                });
            } else {
                updateView(room);
            }
        });
    }

    function updateView(room) {
        $.each($("#users >div"), function (index, element) {
            let $element = $(element);
            if ($element.attr("id") !== "card_" + escape(session_username)) {
                $element.remove();
            }
        });

        $('#slide-out').empty();
        $("#slide-out").append(mobileMenuTemplate);
        appendInviteButton(room);
        $('.collapsible').collapsible();

        $.each(room.stories, function (index, story) {
            if (story.active) {
                activeStory = story;
            }
        });

        if (isCreator) {
            let $availableEstimations = $(".availableEstimations");
            $availableEstimations.empty();
            $availableEstimations.append('<li><a class="modal-trigger" href="#createStory">Create estimation</a></li><li class="divider" /> ');
            $('.modal-trigger').leanModal();
            $.each(room.stories, function (index, story) {
                $availableEstimations.append('<li class="selectable"><a href="#!">' + story.name + '</a></li>');
            });

            $($availableEstimations.find("li.selectable")).click(function (event) {
                server.emit('select_story', $(event.target).text());
            });

            $(".endStoryButton").click(function () {
                server.emit('finish_story');
            })
        }

        if (activeStory) {
            $("#current-story").text(activeStory.name);
        } else {
            $("#current-story").text("None selected. Do so from the dropdown above!");
        }


        function sortByName(a, b) {
            let aName = a.toLowerCase();
            let bName = b.toLowerCase();
            return ((aName === session_username) ? -1 : ((bName === session_username) ? 1 : 0));
        }

        let sort = room.users.sort(sortByName);

        $.each(sort, function (index, user) {
            let isCurrentUser = user === sessionStorage.getItem('ss_user_name');
            let ownCardDoesNotYetExist = $("#card_" + escape(sessionStorage.getItem('ss_user_name'))).length === 0;
            let card = cardTemplate.replace(new RegExp("{{user}}", "g"), escape(user));
            card = card.replace(new RegExp("{{actual_user}}", "g"), user);

            if (isCurrentUser && ownCardDoesNotYetExist) {
                $('#users').append(card);
                let $card = $('#card_' + escape(user));
                $card.addClass("active");
                $($card.find(".card-action")).removeClass("hide");
                if (!storyNumberTemplate) {
                    $.ajax({
                        url: "/templates/estimationNumbers.html",
                        async: false
                    }).success(function (data) {
                        storyNumberTemplate = data;
                        prepareStoryDropdown($card, user);
                    });
                } else {
                    prepareStoryDropdown($card, user);
                }
            } else if (!isCurrentUser) {
                $('#users').append(card);
                let $card = $('#card_' + escape(user));
                $($card.find("#storyText")).hide();
                $($card.find(".card-action")).removeClass("hide");
                $($card.find(".card-action")).css("visibility", "hidden");
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

    function prepareStoryDropdown($card, user) {
        $card.append(storyNumberTemplate.replace(new RegExp("{{user}}", "g"), escape(user)));
        $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                gutter: 0, // Spacing from edge
                alignment: 'left' // Displays dropdown with edge aligned to the left of button
            }
        );

        $('#card_' + escape(user) + ' .dropdown-content li').click(function (event) {
            $($($(event.target).closest(".card")).find("#storyText")).html($(this).text());
        });
        $('#card_' + escape(user) + ' #acceptStory').click(function (event) {
            server.emit('accept_story', $($($(event.target).closest(".card")).find("#storyText")).text());
            event.preventDefault;
        });
    }

    function escape(string) {
        return string.replace(/\s+/g, '_');
    }
})(window, jQuery);