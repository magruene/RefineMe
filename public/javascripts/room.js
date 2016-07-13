(function (global, $) {

    var dialog = document.querySelector('dialog');
    var showDialogButton = document.querySelector('#show-dialog');
    if (! dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    showDialogButton.addEventListener('click', function() {
        dialog.showModal();
    });
    dialog.querySelector('.close').addEventListener('click', function() {
        var estimationName = $("input[name='estimationName']").val();
        server.emit('create-estimation', estimationName);
        dialog.close();
    });

    var notification = document.querySelector('.mdl-js-snackbar');

    function showToast(messageToShow) {
        notification.MaterialSnackbar.showSnackbar(
            {
                message: messageToShow
            }
        );
    }

    var session_username = sessionStorage.getItem('ss_user_name');
    var activeEstimation;
    var isLeader;
    var cardTemplate;
    var mobileMenuTemplate;
    var estimationNumbersTemplate;
    // attempt connection to the server
    try {
        var server = io.connect(global.location.host);
    } catch (e) {
        alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
    }

    $(".button-collapse").sideNav({
        menuWidth: 240, // Default is 240
        closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });

    // if the server connection is successful
    function appendInviteButton(room) {
        $.each($(".invite-url"), function (index, element) {
            var $element = $(element);
            $element.empty();
            $element.append("<input type='text' class='col hide m6' value='https://ancient-journey-65390.herokuapp.com/login?room_name=" + room.room_name + "' /><button class='waves-effect waves-light btn col'>Invite members</button>");
            $($element.find("button")).click(function () {
                var copyText = $($element.find("input"));
                copyText.removeClass("hide");
                copyText.focus();
                copyText.select();
                try {
                    if (document.execCommand('copy')) {
                        showToast("Successfully copied link to clipboard!");
                        copyText.addClass("hide");
                    }
                } catch (err) {
                    showToast("Wasn't able to copy link to clipboard, sorry.");
                }
            });
        });

    }

    function newEstimateAdded(userWhoAddedEstimate) {
        var $card = $('#card_' + userWhoAddedEstimate);
        $($card.find(".preloader-wrapper")).hide();
        if (userWhoAddedEstimate !== session_username) {
            $($card.find("#estimationDone i")).addClass("estimationText-important")
        }
        $($card.find("#estimationDone")).show();
    }

    if (server !== undefined) {
        $('.leave-room').click(function (event) {
            server.emit('leave-room', {
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
            showToast(msg);
        });

        server.on('redirect', function (href) {
            window.location.assign(href);
        });

        server.on("estimationFinished", function (finishedEstimation) {
            $.each(finishedEstimation.estimates, function (index, estimate) {
                var $card = $('#card_' + escape(estimate.user));
                $($card.find("#estimationDone")).hide();
                $($card.find("#estimationText")).html(estimate.estimation);
                $($card.find("#estimationText")).show();
            });
            $('.endEstimationButton').hide();
        });

        server.on('prepare-room-screen', function (room) {

            $("#room_name").text(room.room_name);
            $('#users').empty();
            isLeader = room.leader === sessionStorage.getItem('ss_user_name');
            if (isLeader) {
                $('.availableEstimationsDropdown').removeClass("hide");
                $(".modal-action").click(function () {
                    var estimationName = $("input[name='estimationName']").val();
                    server.emit('create-estimation', estimationName);
                });
            }
        });

        server.on("selectedEstimation", function (room) {
            $.each(room.users, function () {
                updateView(room);
            });
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

    function createMenuDropdown() {
        var menuContainer = document.createElement("div");
        menuContainer.setAttribute("id", "menuContainer");
        var menuButton = document.createElement("button");
        var menu = document.createElement("ul");

        menuContainer.appendChild(menuButton);
        menuContainer.appendChild(menu);

// Configure the button
        menuButton.classList.add("mdl-button");
        menuButton.classList.add("mdl-js-button");
        menuButton.classList.add("mdl-button--icon");
        menuButton.classList.add("mdl-js-ripple-effect"); // Because it's cool
        menuButton.setAttribute("id", "myMenuButton");

// Let's create the HTML that goes inside the button
        var buttonIcon = document.createElement("i");
        buttonIcon.classList.add("material-icons");
        buttonIcon.appendChild(document.createTextNode("more_vert"));
        menuButton.appendChild(buttonIcon);

// Configure the menu
        menu.classList.add("mdl-menu");
        menu.classList.add("mdl-menu--bottom-left");
        menu.classList.add("mdl-js-menu");
        menu.classList.add("mdl-js-ripple-effect");
        menu.setAttribute("for", "myMenuButton"); // Same as the ID assigned to the button

// Add some menu items
        var menuItem1 = document.createElement("li");
        menuItem1.classList.add("mdl-menu__item");
        menuItem1.appendChild(document.createTextNode("Some Action"));
        menu.appendChild(menuItem1);

        var menuItem2 = document.createElement("li");
        menuItem2.classList.add("mdl-menu__item");
        menuItem2.appendChild(document.createTextNode("Another Action"));
        menu.appendChild(menuItem2);

// Upgrade the Elements
        componentHandler.upgradeElement(menuButton, "MaterialButton");
        componentHandler.upgradeElement(menu, "MaterialMenu");  // This will only work if both the menu and the button are included in a container as done above.  If all goes well, and my code isn't full of bugs, the elements should correctly upgrade before being added to the DOM.
        document.querySelectorAll('nav.mdl-navigation')[0].appendChild(menuContainer);
    }

    function updateView(room) {
        $.each($("#users >div"), function (index, element) {
            var $element = $(element);
            if ($element.attr("id") !== "card_" + escape(session_username)) {
                $element.remove();
            }
        });

        $('#slide-out').empty();
        $("#slide-out").append(mobileMenuTemplate);
        appendInviteButton(room);
        $('.collapsible').collapsible();

        $.each(room.estimations, function (index, estimation) {
            if (estimation.active) {
                activeEstimation = estimation;
            }
        });

        if (isLeader) {

            $('.modal-trigger').leanModal();
            // $.each(room.estimations, function (index, estimation) {
            //     var listItem = document.createElement("li");
            //     listItem.appendChild(document.createTextNode(estimation.name));
            //     listItem.className = "mdl-menu__item";
            //     $availableEstimations.appendChild(listItem);
            //     componentHandler.upgradeAllRegistered();
            // });

            createMenuDropdown();

            $(".endEstimationButton").click(function () {
                server.emit('finish-estimation');
            })
        }

        if (activeEstimation) {
            $("#selectedEstimation").text(activeEstimation.name);
        } else {
            $("#selectedEstimation").text("No story selected");
        }


        function sortByName(a, b) {
            var aName = a.toLowerCase();
            var bName = b.toLowerCase();
            return ((aName === session_username) ? -1 : ((bName === session_username) ? 1 : 0));
        }

        var sort = room.users.sort(sortByName);

        $.each(sort, function (index, user) {
            var isCurrentUser = user === sessionStorage.getItem('ss_user_name');
            var ownCardDoesNotYetExist = $("#card_" + escape(sessionStorage.getItem('ss_user_name'))).length === 0;
            var card = cardTemplate.replace(new RegExp("{{user}}", "g"), escape(user));
            card = card.replace(new RegExp("{{actual_user}}", "g"), user);

            if (isCurrentUser && ownCardDoesNotYetExist) {
                $('#users').append(card);
                var $card = $('#card_' + escape(user));
                $card.addClass("active");
                $($card.find(".card-action")).removeClass("hide");
                if (!estimationNumbersTemplate) {
                    $.ajax({
                        url: "/templates/estimationNumbers.html",
                        async: false
                    }).success(function (data) {
                        estimationNumbersTemplate = data;
                        prepareEstimationDropdown($card, user);
                    });
                } else {
                    prepareEstimationDropdown($card, user);
                }
            } else if (!isCurrentUser) {
                $('#users').append(card);
                var $card = $('#card_' + escape(user));
                $($card.find("#estimationText")).hide();
                $($card.find(".card-action")).removeClass("hide");
                $($card.find(".card-action")).css("visibility", "hidden");
            }
        });

        if (activeEstimation) {
            $.each(activeEstimation.estimates, function (index, estimate) {
                var user = estimate.user;
                var $card = $('#card_' + user);

                if (user === session_username) {
                    $($card.find("#estimationText")).html(estimate.estimation);
                }

                newEstimateAdded(user);
            });

            if (activeEstimation.estimates.length === sort.length && isLeader) {
                $('.endEstimationButton').show();
            }
        }
    }

    function prepareEstimationDropdown($card, user) {
        $card.append(estimationNumbersTemplate.replace(new RegExp("{{user}}", "g"), escape(user)));
        $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                gutter: 0, // Spacing from edge
                alignment: 'left' // Displays dropdown with edge aligned to the left of button
            }
        );

        $('#card_' + escape(user) + ' .dropdown-content li').click(function (event) {
            $($($(event.target).closest(".card")).find("#estimationText")).html($(this).text());
        });
        $("#card_" + escape(user) + " #acceptEstimation").click(function (event) {
            server.emit('accept-estimation', $($($(event.target).closest(".card")).find("#estimationText")).text());
            event.preventDefault;
        });
    }

    function escape(string) {
        return string.replace(/\s+/g, '_');
    }
})(window, jQuery);