(function (global, $) {

    var session_username = sessionStorage.getItem('ss_user_name');
    var activeEstimation;
    var isLeader;
    var $chatTitle = $('#chat-title');
    var cardTemplate;
    var estimationNumbersTemplate;
    // attempt connection to the server
    try {
        var server = io.connect('http://127.0.0.1:3000');
    } catch (e) {
        alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
    }

    // if the server connection is successful
    if (server !== undefined) {

        $('#leave-session').click(function (event) {
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
            $('#endEstimationButton').hide();
        });

        server.on('prepare-session-screen', function (session) {
            console.log(session);
            $('#users').empty();
            $('#session-id').html("Session token: " + session.token);
            var name = session_username + ', ';
            $chatTitle.html(name.concat($chatTitle.html()));
            isLeader = session.leader === sessionStorage.getItem('ss_user_name');
            if (isLeader) {
                $('#availableEstimationsDropdown').removeClass("hide");
                $(".modal-action").click(function () {
                   var estimationName = $("input[name='estimationName']").val();
                    server.emit('create-estimation', estimationName);
                });

                server.on("everyoneMadeEstimation", function () {
                    $('#endEstimationButton').show();
                });

                $("#endEstimationButton").click(function () {
                    server.emit('finish-estimation');
                })
            }
        });

        server.on("selectedEstimation", function (session) {
            $.each(session.users, function (index, user) {
                var $card = $('#card_' + user);
                $($card.find("#estimationText")).html("?");
                updateView(session)
            });
        });

        server.on("newEstimateAdded", function (userWhoAddedEstimate) {
            var $card = $('#card_' + userWhoAddedEstimate);
            $($card.find(".preloader-wrapper")).hide();
            if (userWhoAddedEstimate === session_username) {
                $($card.find("#estimationDone i")).addClass("estimationText");
            } else {
                $($card.find("#estimationDone i")).addClass("estimationText-important")
            }
            $($card.find("#estimationDone")).show();
        });

        server.on('update-view', function (session) {
            if(!cardTemplate) {
                $.ajax("/templates/card.html").success(function (data) {
                    cardTemplate = data;
                    updateView(session, cardTemplate);
                });
            } else {
                updateView(session, cardTemplate);
            }
        });
    }

    function updateView(session) {
        $('#users').empty();
        var $availableEstimations = $("#availableEstimations");
        $availableEstimations.empty();
        $.each(session.estimations, function (index, estimation) {
            $availableEstimations.append('<li class="selectable"><a href="#!">' + estimation.name + '</a></li>')
        });
        $($availableEstimations.find("li.selectable")).click(function (event) {
            server.emit('select-estimation', $(event.target).text());
        });

        $.each(session.users, function (index, user) {
            var card = cardTemplate.replace(new RegExp("{{user}}", "g"), user);
            var isCurrentUser = user === sessionStorage.getItem('ss_user_name');
            $('#users').append(card);
            var $card = $('#card_' + user);
            $.each(session.estimations, function (index, estimation) {
                if (estimation.active) {
                    $.each(estimation.estimates, function(index, estimate) {
                        if (estimate.user === session_username) {
                            $($card.find("#estimationText")).html(estimate.estimation);
                        }
                    });
                }
            });
            if (isCurrentUser) {
                $card.addClass("active");
                $($card.find(".card-action")).removeClass("hide");
                if(!estimationNumbersTemplate) {
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

    $(document).ready(function(){
        // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
        $('.modal-trigger').leanModal();
    });

})(window, jQuery);