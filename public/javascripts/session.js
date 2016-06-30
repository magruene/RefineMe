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
        if (userWhoAddedEstimate !== session_username) {
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
                var $card = $('#card_' + escape(estimate.user));
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
            $.each(session.users, function () {
                updateView(session);
            });
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
        $.each($("#users >div"), function (index, element) {
            var $element = $(element);
            if ($element.attr("id") !== "card_" + escape(session_username)) {
                $element.remove();
            }
        });

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

            $(".endEstimationButton").click(function () {
                server.emit('finish-estimation');
            })
        }

        if (activeEstimation) {
            $("#current-estimation").text(activeEstimation.name);
        } else {
            $("#current-estimation").text("None selected. Do so from the dropdown above!");
        }


        function sortByName(a, b) {
            var aName = a.toLowerCase();
            var bName = b.toLowerCase();
            return ((aName === session_username) ? -1 : ((bName === session_username) ? 1 : 0));
        }

        var sort = session.users.sort(sortByName);

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