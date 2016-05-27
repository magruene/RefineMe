(function (global, $) {

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
    function appendInviteButton(session) {
        $.each($(".invite-url"), function (index, element) {
            var $element = $(element);
            $element.empty();
            $element.append("<input type='text' class='col hide m6' value='https://ancient-journey-65390.herokuapp.com/login?session_token=" + session.token + "' /><button class='waves-effect waves-light btn col'>Invite members</button>");
            $($element.find("button")).click(function () {
                var copyText = $($element.find("input"));
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
        var $card = $('#card_' + userWhoAddedEstimate);
        $($card.find(".preloader-wrapper")).hide();
        if (userWhoAddedEstimate === session_username) {
            $($card.find("#estimationText")).html(estimate.estimation);
            $($card.find("#estimationDone i")).addClass("estimationText");
        } else {
            $($card.find("#estimationDone i")).addClass("estimationText-important")
        }
        $($card.find("#estimationDone")).show();
    }

    if (server !== undefined) {
        $('.leave-session').click(function (event) {
            server.emit('leave-session', {
                token: sessionStorage.getItem('ss_token'),
                user_name: sessionStorage.getItem('ss_user_name')
            });
            event.preventDefault;
        });

        server.emit('session-connection', {
            token: sessionStorage.getItem('ss_token'),
            user_name: sessionStorage.getItem('ss_user_name')
        });

        // alert error messages returned from the server
        server.on('alert', function (msg) {
            Materialize.toast(msg, 4000, 'rounded');
        });

        server.on('redirect', function (href) {
            window.location.assign(href);
        });

        server.on("estimationFinished", function (finishedEstimation) {
            $.each(finishedEstimation.estimates, function (index, estimate) {
                var $card = $('#card_' + estimate.user);
                $($card.find("#estimationDone")).hide();
                $($card.find("#estimationText")).html(estimate.estimation);
                $($card.find("#estimationText")).show();
            });
            $('.endEstimationButton').hide();
        });

        server.on('prepare-session-screen', function (session) {

            $("#session_token").text(session.token);
            $('#users').empty();
            isLeader = session.leader === sessionStorage.getItem('ss_user_name');
            if (isLeader) {
                $('.availableEstimationsDropdown').removeClass("hide");
                $(".modal-action").click(function () {
                    var estimationName = $("input[name='estimationName']").val();
                    server.emit('create-estimation', estimationName);
                });
            }
        });

        server.on("selectedEstimation", function (session) {
            $.each(session.users, function (index, user) {
                var $card = $('#card_' + user);
                updateView(session)
            });
        });

        server.on("newEstimateAdded", function (userWhoAddedEstimate) {
            newEstimateAdded(userWhoAddedEstimate);
        });

        server.on('update-view', function (session) {
            if (!cardTemplate && !mobileMenuTemplate) {
                $.ajax("/templates/card.html").success(function (card) {
                    $.ajax("/templates/mobileMenu.html").success(function (mobileMenu) {
                        cardTemplate = card;
                        mobileMenuTemplate = mobileMenu;
                        updateView(session);
                    });
                });
            } else {
                updateView(session);
            }
        });
    }

    function updateView(session) {
        $('#users').empty();
        $('#slide-out').empty();
        $("#slide-out").append(mobileMenuTemplate);
        appendInviteButton(session);
        $('.collapsible').collapsible();

        $.each(session.estimations, function (index, estimation) {
            if (estimation.active) {
                activeEstimation = estimation;
            }
        });

        if (isLeader) {
            var $availableEstimations = $(".availableEstimations");
            $availableEstimations.empty();
            $availableEstimations.append('<li><a class="modal-trigger" href="#createEstimation">Create estimation</a></li><li class="divider" /> ');
            $('.modal-trigger').leanModal();
            $.each(session.estimations, function (index, estimation) {
                $availableEstimations.append('<li class="selectable"><a href="#!">' + estimation.name + '</a></li>');
            });

            $($availableEstimations.find("li.selectable")).click(function (event) {
                server.emit('select-estimation', $(event.target).text());
            });

            server.on("everyoneMadeEstimation", function () {
                $('.endEstimationButton').show();
            });

            $(".endEstimationButton").click(function () {
                server.emit('finish-estimation');
            })
        }

        if (activeEstimation) {
            $("#current-estimation").text(activeEstimation.name);
        } else {
            $("#current-estimation").text("None selected. Do so from the dropdown above!");
        }

        $.each(session.users, function (index, user) {
            var card = cardTemplate.replace(new RegExp("{{user}}", "g"), user);
            var isCurrentUser = user === sessionStorage.getItem('ss_user_name');
            $('#users').append(card);
            var $card = $('#card_' + user);
            if (isCurrentUser) {
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
            } else {
                $($card.find(".preloader-wrapper")).show();
                $($card.find("#estimationText")).hide();
            }
        });

        if (activeEstimation) {
            $.each(activeEstimation.estimates, function (index, estimate) {
                newEstimateAdded(estimate.user);
            });
        }
    }

    function prepareEstimationDropdown($card, user) {
        $card.append(estimationNumbersTemplate.replace(new RegExp("{{user}}", "g"), user));
        $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                gutter: 0, // Spacing from edge
                alignment: 'left' // Displays dropdown with edge aligned to the left of button
            }
        );

        $('#card_' + user + ' .dropdown-content li').click(function (event) {
            $($($(event.target).closest(".card")).find("#estimationText")).html($(this).text());
        });
        $("#card_" + user + " #acceptEstimation").click(function (event) {
            server.emit('accept-estimation', $($($(event.target).closest(".card")).find("#estimationText")).text());
            event.preventDefault;
        });
    }
})(window, jQuery);