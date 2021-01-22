$(document).ready(function () {
    function getdetails(link, values) {
        return $.ajax({
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            url: link,
            type: "post",
            dataType: "json",
            data: values,
        });
    }
    //in this case, because of how javascript works, global variables are a necessary evil to keep certain
    //events initialised in between functions.
    //TODO is it really
    let controlEnvironment = "field"; //default control environment
    let conversationArray = []; //array that holds all conversation lines
    let convArrayIndex = 0; //current position in the array
    var userData;
    let user = $("#user").attr("value");
    let moveIdle = true; // movement sprite value
    let moveDirection; //direction in which the sprite is moving before another direction input
    let inEventRange; //checks if sprite is currently in event range
    let eventType; //type of the event in range
    let conversationId; //id of the conversation we're going to process
    let canMove = true; // whether the user can move or not
    let eventCode;
    let inPc; //whether user is in pc or not
    let values;

    //global battle values
    let trainerData, rivalData;
    let combatType;
    let fainted = false; //to know if changing character spends a turn or not
    let captured;

    var canvas = document.getElementById("eventSprite");
    var context = canvas.getContext("2d");
    var img = new Image();
    img.onload = function () {
        context.drawImage(img, 0, 0);
    };

    values = {
        user: user,
    };

    getdetails("/play/getData", values).done(function (response) {
        if (response.success !== undefined) {
            userData = response.success;

            if (userData.position === 0) {
                mapZero(userData);
            } else {
                let values = {
                    map: userData.position,
                    user: user,
                    prevMap: userData.prevPosition,
                };
                getdetails("/play/getMap", values).done(function (response) {
                    if (response.success !== undefined) {
                        let main = response.success.mainSprite;
                        let event = response.success.eventSprite;
                        let id = response.success.id;

                        //append map to playfield

                        $("#npcSpritePosition").attr("hidden", "true");
                        $("#textBox").attr("hidden", "true");

                        $("#mainSprite").append(
                            "<img src=" + mapsUrl + "/" + id + "/" + main + ">"
                        );
                        img.src = mapsUrl + "/" + id + "/" + event;

                        //load sprite
                        $("#userSprite").append(
                            "<img src=" +
                                playerSpritesUrl +
                                "/" +
                                userData.sprite +
                                "/" +
                                response.position.direction +
                                "-idle.png>"
                        );
                        moveDirection = "up";
                        if (response.position !== undefined) {
                            $("#userSprite")
                                .children()
                                .css({
                                    top: response.position.charY + "px",
                                    left: response.position.charX + "px",
                                });
                        }
                    }
                });
            }
        } else {
            //TODO what do we do here
        }
    });

    function mapZero(userData) {
        //this function is triggered when the user is new to the game and he is nowhere in the ingame map
        //it is meant to trigger the tutorial scenes
        //we will load the tutorial scene
        values = {
            user: userData.nick,
            conversationId: 1,
        };
        getdetails("/play/getConversation", values).done(function (response) {
            if (response.success !== undefined) {
                conversationArray = response.success;
                //load first panel of the scene
                $("#textBox").html(conversationArray[0].lineContent);
                controlEnvironment = "conversation";
                let values = {
                    conversation: conversationArray[convArrayIndex],
                    user: user,
                };

                getdetails("/play/processConversation", values).done(function (
                    response
                ) {
                    if (response.success !== undefined) {
                        $("#textBox").html(
                            conversationArray[convArrayIndex].lineContent
                        );

                        $("#npcSpritePosition").empty();

                        if (
                            conversationArray[convArrayIndex].animation !== null
                        ) {
                            $("#npcSpritePosition").append(
                                "<img src='animations/" +
                                    conversationArray[convArrayIndex]
                                        .character +
                                    "/" +
                                    conversationArray[convArrayIndex]
                                        .animation +
                                    ".png'>"
                            );
                        } else {
                            $("#npcSpritePosition").append(
                                "<img src='animations/" +
                                    conversationArray[convArrayIndex]
                                        .character +
                                    "/1.png'>"
                            );
                        }

                        //process event
                        if (
                            conversationArray[convArrayIndex].eventTrigger !==
                            null
                        ) {
                            processEvent(
                                conversationArray[convArrayIndex].eventTrigger
                            );
                        }
                    }
                });
            }
        });
    }

    $(document).on("keydown", function (event) {
        switch (controlEnvironment) {
            case "conversation":
                switch (event.keyCode) {
                    case 65:
                        //A button, advance conversation
                        //get conversation array and process it
                        convArrayIndex++;
                        if (convArrayIndex >= conversationArray.length) {
                            //conversation is finished
                            controlEnvironment = "field";
                            conversationArray = [];
                            convArrayIndex = 0;
                            eventType = "";
                            canMove = true;

                            $("#npcSpritePosition").attr("hidden", "true");
                            $("#textBox").empty().attr("hidden", "true");
                            break;
                        } else {
                            let values = {
                                conversation: conversationArray[convArrayIndex],
                                user: user,
                            };

                            getdetails(
                                "/play/processConversation",
                                values
                            ).done(function (response) {
                                if (response.success !== undefined) {
                                    $("#textBox").html(
                                        conversationArray[convArrayIndex]
                                            .lineContent
                                    );

                                    $("#npcSpritePosition").empty();

                                    if (
                                        conversationArray[convArrayIndex]
                                            .animation !== null
                                    ) {
                                        $("#npcSpritePosition").append(
                                            "<img src='animations/" +
                                                conversationArray[
                                                    convArrayIndex
                                                ].character +
                                                "/" +
                                                conversationArray[
                                                    convArrayIndex
                                                ].animation +
                                                ".png'>"
                                        );
                                    } else {
                                        $("#npcSpritePosition").append(
                                            "<img src='animations/" +
                                                conversationArray[
                                                    convArrayIndex
                                                ].character +
                                                "/1.png'>"
                                        );
                                    }

                                    //process event
                                    if (
                                        conversationArray[convArrayIndex]
                                            .eventTrigger !== null
                                    ) {
                                        processEvent(
                                            conversationArray[convArrayIndex]
                                                .eventTrigger
                                        );
                                    }
                                }
                            });
                        }
                }
                break;
            case "field":
                let movement = 10;
                let top = parseInt(
                    $("#userSprite").children().first().css("top"),
                    10
                );
                let left = parseInt(
                    $("#userSprite").children().first().css("left"),
                    10
                );
                var x, y;
                switch (event.keyCode) {
                    case 38:
                        //up arrow
                        x = left;
                        y = top - movement;

                        checkEvent(x, y);
                        if (!canMove) {
                            //reset values
                            x = left;
                            y = top + movement;
                        } else {
                            //change animation
                            if (moveDirection === "up") {
                                if (moveIdle === true) {
                                    //change animation to moving
                                    $("#userSprite")
                                        .html("")
                                        .append(
                                            "<img src=" +
                                                playerSpritesUrl +
                                                "/" +
                                                userData.sprite +
                                                "/up-move.png>"
                                        );
                                    moveIdle = false;
                                } else {
                                    //change animation to idling
                                    $("#userSprite")
                                        .html("")
                                        .append(
                                            "<img src=" +
                                                playerSpritesUrl +
                                                "/" +
                                                userData.sprite +
                                                "/up-idle.png>"
                                        );
                                    moveIdle = true;
                                }
                            } else {
                                //always idling to the new direction
                                $("#userSprite")
                                    .html("")
                                    .append(
                                        "<img src=" +
                                            playerSpritesUrl +
                                            "/" +
                                            userData.sprite +
                                            "/up-idle.png>"
                                    );
                                moveDirection = "up";
                                moveIdle = true;
                            }
                            $("#userSprite")
                                .children()
                                .css({ top: y + "px", left: x });
                        }

                        break;
                    case 37:
                        //left arrow
                        x = left - movement;
                        y = top;

                        checkEvent(x, y);
                        if (!canMove) {
                            //reset values
                            x = left + movement;
                            y = top;
                        } else {
                            //change animation
                            if (moveDirection === "left") {
                                if (moveIdle === true) {
                                    //change animation to moving
                                    $("#userSprite")
                                        .html("")
                                        .append(
                                            "<img src=" +
                                                playerSpritesUrl +
                                                "/" +
                                                userData.sprite +
                                                "/left-move.png>"
                                        );
                                    moveIdle = false;
                                } else {
                                    //change animation to idling
                                    $("#userSprite")
                                        .html("")
                                        .append(
                                            "<img src=" +
                                                playerSpritesUrl +
                                                "/" +
                                                userData.sprite +
                                                "/left-idle.png>"
                                        );
                                    moveIdle = true;
                                }
                            } else {
                                //always idling to the new direction
                                $("#userSprite")
                                    .html("")
                                    .append(
                                        "<img src=" +
                                            playerSpritesUrl +
                                            "/" +
                                            userData.sprite +
                                            "/left-idle.png>"
                                    );
                                moveDirection = "left";
                                moveIdle = true;
                            }
                            $("#userSprite")
                                .children()
                                .css({ top: y, left: x + "px" });
                        }
                        break;
                    case 39:
                        //right arrow
                        x = left + movement;
                        y = top;

                        checkEvent(x, y);
                        if (!canMove) {
                            //reset values
                            x = left - movement;
                            y = top;
                        } else {
                            //change animation
                            if (moveDirection === "right") {
                                if (moveIdle === true) {
                                    //change animation to moving
                                    $("#userSprite")
                                        .html("")
                                        .append(
                                            "<img src=" +
                                                playerSpritesUrl +
                                                "/" +
                                                userData.sprite +
                                                "/right-move.png>"
                                        );
                                    moveIdle = false;
                                } else {
                                    //change animation to idling
                                    $("#userSprite")
                                        .html("")
                                        .append(
                                            "<img src=" +
                                                playerSpritesUrl +
                                                "/" +
                                                userData.sprite +
                                                "/right-idle.png>"
                                        );
                                    moveIdle = true;
                                }
                            } else {
                                //always idling to the new direction
                                $("#userSprite")
                                    .html("")
                                    .append(
                                        "<img src=" +
                                            playerSpritesUrl +
                                            "/" +
                                            userData.sprite +
                                            "/right-idle.png>"
                                    );
                                moveDirection = "right";
                                moveIdle = true;
                            }
                            $("#userSprite")
                                .children()
                                .css({ top: y, left: x + "px" });
                        }
                        break;
                    case 40:
                        //down arrow
                        x = left;
                        y = top + movement;

                        checkEvent(x, y);
                        if (!canMove) {
                            //reset values
                            x = left;
                            y = top - movement;
                        } else {
                            //change animation
                            if (moveDirection === "down") {
                                if (moveIdle === true) {
                                    //change animation to moving
                                    $("#userSprite")
                                        .html("")
                                        .append(
                                            "<img src=" +
                                                playerSpritesUrl +
                                                "/" +
                                                userData.sprite +
                                                "/down-move.png>"
                                        );
                                    moveIdle = false;
                                } else {
                                    //change animation to idling
                                    $("#userSprite")
                                        .html("")
                                        .append(
                                            "<img src=" +
                                                playerSpritesUrl +
                                                "/" +
                                                userData.sprite +
                                                "/down-idle.png>"
                                        );
                                    moveIdle = true;
                                }
                            } else {
                                //always idling to the new direction
                                $("#userSprite")
                                    .html("")
                                    .append(
                                        "<img src=" +
                                            playerSpritesUrl +
                                            "/" +
                                            userData.sprite +
                                            "/down-idle.png>"
                                    );
                                moveDirection = "down";
                                moveIdle = true;
                            }
                            $("#userSprite")
                                .children()
                                .css({ top: y + "px", left: x });
                        }
                        break;
                    case 65:
                        //A button
                        if (inEventRange === true) {
                            if (eventType === "conversation") {
                                //trigger conversation
                                values = {
                                    user: user,
                                    conversationId: conversationId,
                                };
                                startConversation(values);
                            } else {
                                //special event
                                processEvent(eventCode);
                            }
                        }
                        break;

                    case 13:
                        //Enter button
                        //open menu
                        inPc = false;
                        $("#inventoryModal").removeAttr("hidden").modal("show");
                }
                break;
        }
    });

    function checkEvent(x, y) {
        //get color below div

        var p = context.getImageData(x, y, 1, 1).data;

        if (p[0] === 0 && p[1] === 0 && p[2] === 0 && p[3] === 0) {
            //check if its nothing
            inEventRange = false;
            canMove = true;
        } else if (p[0] === 0 && p[1] === 255 && p[2] === 248 && p[3] === 255) {
            //check if its hitbox

            canMove = false;
        } else if (p[0] === 0 && p[1] === 255 && p[2] === 53 && p[3] === 255) {
            //check if its grass
            //does some related to doll battling
            canMove = true;
            //each time we step on green, chance of summoning a wild character of 10%
            var chance = Math.floor(Math.random() * 100);
            if (chance > 90) {
                //get map data
                values = {
                    user: user,
                    mapId: userData.position,
                };
                getdetails("/play/getMapData", values).done(function (
                    response
                ) {
                    if (response.success !== undefined) {
                        //we have map data
                        var mapLevel = response.success.levelRange.split("-");
                        var charLevel =
                            mapLevel[
                                Math.floor(Math.random() * mapLevel.length)
                            ];

                        var mapChars = response.success.mapChars.split(",");
                        var charId =
                            mapChars[
                                Math.floor(Math.random() * mapChars.length)
                            ];
                        values = {
                            charLevel: charLevel,
                            charId: charId,
                            user: user,
                        };
                        getdetails("/play/createWildCharacter", values).done(
                            function (response) {
                                if (response.success !== undefined) {
                                    //true
                                    var trainerId = userData.nick;
                                    var rivalId = "temp_" + userData.nick;
                                    combatType = "wild";
                                    getBattleData(trainerId, rivalId);
                                } else {
                                    //TODO what do we do here
                                }
                            }
                        );
                    }
                });
            }
        } else {
            //its a non-defined event
            //get current full p value, compare to rgb, convert the value to hex, compare the hex value to list of known events
            //get full p values
            let color = [p[0], p[1], p[2]];
            values = {
                color: color,
                user: userData.nick,
            };
            getdetails("/play/getEventCode", values).done(function (response) {
                if (response.success !== undefined) {
                    if (response.success.eventType === "change") {
                        //change map
                        if (processMap(userData.position, response.success.mapChange) === true) {
                            //TODO why is this empty
                        }
                    } else if (response.success.eventType === "conversation") {
                        //check if callable
                        if (response.userevent !== undefined) {
                            if (response.userevent.callable === "true") {
                                //can be called
                                canMove = false;
                                inEventRange = true;
                                eventType = "conversation";
                                conversationId =
                                    response.success.conversationTrigger;
                            } else {
                                canMove = true;
                            }
                        }
                    } else if (response.success.eventType === "special") {
                        eventCode = response.success.id;
                        inEventRange = true;
                        canMove = true;
                        eventType = "";
                    } else {
                        //TODO what do we do here
                    }
                }
            });
        }
    }

    function processEvent(eventId) {
        eventId = parseInt(eventId);
        switch (eventId) {
            case 1:
                //add picture to playfield
                var img = "/sprites/characters/Marisa/sprite.png";
                $("#playField").append(
                    "<img id='event1Img' src='" + img + "'>"
                );
                break;
            case 2:
                //remove picture
                $("#event1Img").remove();
                break;
            case 3:
                //add 2 sprite options
                let src1 = "/sprites/player/card/M.png";
                let src2 = "/sprites/player/card/F.png";
                let button1 =
                    "<input type='image' src='" +
                    src1 +
                    "' class='btTxt genderButton tutorialSprite' id='maleSprite'>";
                let button2 =
                    "<input type='image' src='" +
                    src2 +
                    "' class='btTxt genderButton tutorialSprite' id='femaleSprite'>";

                $("#playField").append(button1);
                $("#playField").append(button2);

                break;
            case 4:
                //load map 1
                values = {
                    map: 1,
                    user: user,
                    prevMap: 0,
                };
                getdetails("/play/getMap", values).done(function (response) {
                    if (response.success !== undefined) {
                        let main = response.success.mainSprite;
                        let event = response.success.eventSprite;
                        let id = response.success.id;
                        //append map to playfield
                        $("#mainSprite").append(
                            "<img src=" + mapsUrl + "/" + id + "/" + main + ">"
                        );
                        $("#eventSprite").append(
                            "<img src=" + mapsUrl + "/" + id + "/" + event + ">"
                        );
                        window.location.reload();
                    }
                });
                break;
            //numbers are missing because the events inbetween are regular conversation/event triggers which have been automatized
            case 19:
                //pc opening
                inPc = true;
                $("#PCModal").modal("show");
                inEventRange = false;
                break;
            case 21:
                //shop line after closing modal
                //first, end the previous one
                conversationArray = [];
                convArrayIndex = 0;

                $("#npcSpritePosition").attr("hidden", "true");
                $("#textBox").empty().attr("hidden", "true");

                values = {
                    user: user,
                    conversationId: 15,
                };
                startConversation(values);
                break;

            case 32:
                //healing team
                //use the user to heal all members of the team that are in positions 1/6
                values = {
                    user: user,
                };
                getdetails("/play/healTeam", values).done(function (response) {
                    if (response.error !== undefined) {
                        //TODO what do we do here
                    }
                });
                break;
            case 33:
                //open shop
                $("#shopModal").modal("show");
                $("#shopModal")
                    .children()
                    .children()
                    .children()
                    .first()
                    .attr("data-id", "#store_town1");
                break;
            case 34:
                //receive first character
                values = {
                    user: user,
                    instance: 1,
                };
                getdetails("/play/getCharacter", values).done(function (
                    response
                ) {
                    if (response.success !== undefined) {
                        //character saved, proceed with event
                        //load conversation
                        values = {
                            user: user,
                            conversationId: 4,
                        };
                        startConversation(values);
                    } else {
                        //TODO what do we do here
                    }
                });
                break;
            case 35:
                //triggered after receiving reimu, closes way out of the lab, activates marisa callable, disabled reimu dialogue
                toggleCall(user, 25);
                toggleCall(user, 26);
                toggleCall(user, 28);
                break;
            case 36:
                //activate Marisa's battle
                //dialogue has already been said, set up battle
                controlEnvironment = "battle";
                //get battle data
                //few notations: JS handles all the events, PHP the CALCULATIONS AND DATA GETTING ONLY
                //case 36 signals the specific battle we're doing, so we know which combat data to get
                //2 functions needed ->
                // getBattleData()-> receives data to get specific data from trainers, so it must receive the trainers id
                // startBattle() -> this one sets up all the non-dynamic elements that are non-specific to a battle and receives the battle data (arrays) which have already been sent
                var trainerId = userData.nick;
                var rivalId = "#rival_1";
                combatType = "trainer";
                getBattleData(trainerId, rivalId);

                break;
            case 37:
                //toggle events 28, 33, 30, 7, 27
                toggleCall(user, 28);
                toggleCall(user, 33);
                toggleCall(user, 30);
                toggleCall(user, 7);
                toggleCall(user, 27);
                break;
            case 38:
                //route 1 trainers battle
                controlEnvironment = "battle";
                var trainerId = userData.nick;
                var rivalId = "#route1_trainer1";
                combatType = "trainer";
                getBattleData(trainerId, rivalId);

                break;
            case 39:
                //gym leader Aya's battle
                controlEnvironment = "battle";
                var trainerId = userData.nick;
                var rivalId = "#gymleader_1";
                combatType = "trainer";
                getBattleData(trainerId, rivalId);

                break;
            case 40:
                //trigger conversation 22 and receive first badge
                userData.progress++;
                values = {
                    user: user,
                    conversationId: 22,
                };
                startConversation(values);
                break;
            case 41:
                //trigger conversation 23
                toggleCall(user, 22);
                values = {
                    user: user,
                    conversationId: 23,
                };
                startConversation(values);
                break;
            default:
                break;
        }
    }

    function processMap(currentMap, nextMap) {
        let values = {
            map: nextMap,
            user: user,
            prevMap: currentMap,
        };
        getdetails("/play/getMap", values).done(function (response) {
            if (response.success !== undefined) {
                let main = response.success.mainSprite;
                let event = response.success.eventSprite;
                let id = response.success.id;

                //get new user data
                getUserData(user);

                //append map to playfield

                $("#mainSprite").html("");
                $("#userSprite").html("");

                $("#mainSprite").append(
                    "<img src=" + mapsUrl + "/" + id + "/" + main + ">"
                );

                context = canvas.getContext("2d");
                img = new Image();
                img.onload = function () {
                    context.drawImage(img, 0, 0);
                };
                img.src = mapsUrl + "/" + id + "/" + event;

                //load sprite
                $("#userSprite").append(
                    "<img src=" +
                        playerSpritesUrl +
                        "/" +
                        userData.sprite +
                        "/" +
                        response.position.direction +
                        "-idle.png>"
                );
                moveDirection = "up";
                if (response.position !== undefined) {
                    $("#userSprite")
                        .children()
                        .css({
                            top: response.position.charY + "px",
                            left: response.position.charX + "px",
                        });
                }

                window.location.reload();
            } else {
                //TODO what do we do here
            }
        });
    }

    function getUserData(user) {
        //get values of user when its changed so we can use it in javascript functions
        let values = {
            user: user,
        };
        getdetails("/play/getData", values).done(function (response) {
            if (response.success !== undefined) {
                userData = response.success;
            }
        });
    }

    function startConversation(values) {
        $("#npcSpritePosition").removeAttr("hidden");
        $("#textBox").removeAttr("hidden");
        getdetails("/play/getConversation", values).done(function (response) {
            if (response.success !== undefined) {
                conversationArray = response.success;
                convArrayIndex = 0;
                //load first panel of the scene
                $("#textBox").html(
                    conversationArray[convArrayIndex].lineContent
                );
                //load first sprite
                $("#npcSpritePosition").empty();
                if (conversationArray[convArrayIndex].animation !== null) {
                    $("#npcSpritePosition").append(
                        "<img src='animations/" +
                            conversationArray[convArrayIndex].character +
                            "/" +
                            conversationArray[convArrayIndex].animation +
                            ".png'>"
                    );
                } else {
                    $("#npcSpritePosition").append(
                        "<img src='animations/" +
                            conversationArray[convArrayIndex].character +
                            "/1.png'>"
                    );
                }

                //process event
                if (conversationArray[convArrayIndex].eventTrigger !== null) {
                    processEvent(
                        conversationArray[convArrayIndex].eventTrigger
                    );
                }
                controlEnvironment = "conversation";
            }
        });
    }

    $(".characterButton").on("click", function () {
        $("#characterModal").modal("show");
        //load characters from DB and show them in format

        values = {
            user: user,
        };
        if (inPc === true) {
            values.pc = true;
        }
        getdetails("/play/getCharacterRoster", values).done(function (
            response
        ) {
            if (response.success !== undefined) {
                charData = response.success;
                if (response.moveList !== undefined) {
                    moveList = response.moveList;
                }
                //clear div
                $("#characterList").html("");
                //append data to div
                $.each(charData, function (i) {
                    //get sprite id
                    let img =
                        "/sprites/characters/" +
                        charData[i].char_name +
                        "/sprite.png";
                    let exp = charData[i].exp - (charData[i].exp / 1000) * 1000;
                    let lvl = charData[i].level;
                    let atk = (charData[i].atkMax / 100) * lvl;
                    let def = (charData[i].defMax / 100) * lvl;
                    let spe = (charData[i].speedMax / 100) * lvl;

                    //check moves
                    var moveDiv = "";
                    $.each(moveList[i], function (j) {
                        moveDiv +=
                            "<tr><td>" +
                            moveList[i][j].type +
                            "</td><td>" +
                            moveList[i][j].name +
                            "</td><td>" +
                            moveList[i][j].description +
                            "</td><td>" +
                            moveList[i][j].power +
                            "</td><td>" +
                            moveList[i][j].accuracy +
                            "</td><td>" +
                            moveList[i][j].cost +
                            "</td>";
                    });

                    $("#characterList").append(
                        "<div class='buttonPos' id='" +
                            charData[i].position +
                            "'><button value='" +
                            charData[i].position +
                            "' class='float-right btn btn-default btn-success'>Sort</button></div>"
                    );
                    $("#characterList").append(
                        "<div class=cont><div class='leftrow'>" +
                            "<img class='spriteImg' src='" +
                            img +
                            "'>" +
                            "<div class='toprow'><div class='charName'>" +
                            charData[i].char_name +
                            "<div class='charLevel'>Lv." +
                            lvl +
                            "<div class='exp'>Exp:" +
                            exp +
                            "/1000</div>" +
                            "</div></div></div>" +
                            "<div class='middlerow'><div class='health'>HP:" +
                            charData[i].healthPointsCurrent +
                            "/" +
                            charData[i].healthpoints +
                            "</div>" +
                            "<div class='stamina'>ST:" +
                            charData[i].staminaPointsCurrent +
                            "/" +
                            charData[i].staminapoints +
                            "</div>" +
                            "</div>" +
                            "<div class='thirdrow'><div>" +
                            charData[i].type +
                            "</div></div>" +
                            "<div class='fourthrow'><div>" +
                            charData[i].skill_name +
                            ": " +
                            charData[i].skill_desc +
                            "</div></div>" +
                            "<div class='rightrow'><table class='table-bordered'>" +
                            "<tr><td class='firstTD'>ATK:</td><td>" +
                            atk +
                            "</td></tr>" +
                            "<tr><td class='firstTD'>DEF:</td><td>" +
                            def +
                            "</td></tr>" +
                            "<tr><td class='firstTD'>SPE:</td><td>" +
                            spe +
                            "</td></tr>" +
                            "</table></div></div>" +
                            "<div class='moverow'><table class='table-bordered'><th>Type</th><th>Name</th><th>Description</th><th>Power</th><th>Accuracy</th><th>Cost</th>" +
                            moveDiv +
                            "</table></div></div>"
                    );
                });
                $("#characterList").children().slice(12).css({
                    "background-color": "black",
                    color: "white",
                });
            } else {
                //TODO proper error logging
            }
        });
    });

    $(".itemsButton").on("click", function () {
        $("#itemsModal").modal("show");
        //load items from DB
        values = {
            user: user,
        };
        getdetails("/play/getItems", values).done(function (response) {
            if (response.success !== undefined) {
                let itemList = response.success;
                var itemDiv = "";
                $("#itemsDiv").empty();
                $.each(itemList, function (i) {
                    let img =
                        "/sprites/items/" + itemList[i].name + "/sprite.png";
                    let useButton =
                        itemList[i].category !== "battle_item"
                            ? "<button id='" +
                              itemList[i].id +
                              "'class='btn-success btn btn-default itemUse'>Use</button>"
                            : "";

                    itemDiv +=
                        "<tbody><tr class='itemFrame'><td><img class='itemImg' src='" +
                        img +
                        "'></td>" +
                        "<td>" +
                        itemList[i].name +
                        "</td>" +
                        "<td>" +
                        itemList[i].desc +
                        "</td>" +
                        "<td>" +
                        itemList[i].stock +
                        "</td>" +
                        "<td>" +
                        useButton +
                        "</td></tr>";
                });

                $("#itemsDiv").append(
                    "<table class='table-bordered'>" +
                        "<th></th>" +
                        "<th>Name</th>" +
                        "<th>Desc</th>" +
                        "<th>Stock</th>" +
                        "<tbody>" +
                        itemDiv +
                        "</tbody></table>"
                );
            }
        });
    });

    $(".dataButton").on("click", function () {
        $("#dataModal").modal("show");
        //open and build trainer card
        //get current info from user we will be using in the card
        values = {
            user: user,
        };
        getdetails("play/getDataCard", values).done(function (response) {
            if (response.success !== undefined) {
                $("#cardDiv").empty();
                let data = response.success;
                let img = "/sprites/player/card/" + data.sprite + ".png";

                let cardDiv =
                    "<div id='cardCont'>" +
                    "<div id='cardSpriteDiv'><img id='cardSprite' src='" +
                    img +
                    "'></div>" +
                    "<div id='cardName'>" +
                    data.nick +
                    "</div>" +
                    "<div id='cardBalance'>Balance: " +
                    data.balance +
                    "</div>" +
                    "<div id='cardBadges'>Badges: " +
                    data.progress +
                    "</div>" +
                    "</div>";

                $("#cardDiv").append(cardDiv);
            } else {
                //TODO proper error logging
            }
        });
    });

    var positionArray = [];
    //TODO what is this doing here ^
    $(document).on("click", ".buttonPos", function () {
        positionArray.push($(this).children().first().val());

        $(this)
            .children()
            .first()
            .removeClass("btn-success")
            .addClass("btn-danger")
            .html("Sorting...");
        if (positionArray.length === 2) {
            var canSort = true;
            for (let i = 0; i < positionArray.length; i++) {
                if (i === 0) {
                    var num = positionArray[i];
                } else {
                    if (positionArray[i] === num) {
                        //clicked the same button twice
                        $(".buttonPos")
                            .children()
                            .removeClass("btn-danger")
                            .addClass("btn-success")
                            .html("Sort");
                        positionArray = [];
                        canSort = false;
                    }
                }
            }
            if (canSort === true) {
                //change positions
                let values = {
                    pos1: positionArray[0],
                    pos2: positionArray[1],
                    user: user,
                };
                if (inPc === true) {
                    values.pc = true;
                }

                getdetails("/play/sortCharacters", values).done(function (
                    response
                ) {
                    if (response.success !== undefined) {
                        charData = response.success;
                        if (response.moveList !== undefined) {
                            moveList = response.moveList;
                        }
                        //clear div
                        $("#characterList").html("");
                        //append data to div
                        $.each(charData, function (i) {
                            //get sprite id
                            let img =
                                "/sprites/characters/" +
                                charData[i].char_name +
                                "/sprite.png";
                            let exp =
                                charData[i].exp -
                                (charData[i].exp / 1000) * 1000;
                            let lvl = charData[i].level;
                            let atk = (charData[i].atkMax / 100) * lvl;
                            let def = (charData[i].defMax / 100) * lvl;
                            let spe = (charData[i].speedMax / 100) * lvl;

                            //check moves
                            var moveDiv = "";
                            $.each(moveList[i], function (j) {
                                moveDiv +=
                                    "<tr><td>" +
                                    moveList[i][j].type +
                                    "</td><td>" +
                                    moveList[i][j].name +
                                    "</td><td>" +
                                    moveList[i][j].description +
                                    "</td><td>" +
                                    moveList[i][j].power +
                                    "</td><td>" +
                                    moveList[i][j].accuracy +
                                    "</td><td>" +
                                    moveList[i][j].cost +
                                    "</td>";
                            });

                            $("#characterList").append(
                                "<div class='buttonPos' id='" +
                                    charData[i].position +
                                    "'><button value='" +
                                    charData[i].position +
                                    "' class='float-right btn btn-default btn-success'>Sort</button></div>"
                            );
                            $("#characterList").append(
                                "<div class=cont><div class='leftrow'>" +
                                    "<img class='spriteImg' src='" +
                                    img +
                                    "'>" +
                                    "<div class='toprow'><div class='charName'>" +
                                    charData[i].char_name +
                                    "<div class='charLevel'>Lv." +
                                    lvl +
                                    "<div class='exp'>Exp:" +
                                    exp +
                                    "/1000</div>" +
                                    "</div></div></div>" +
                                    "<div class='middlerow'><div class='health'>HP:" +
                                    charData[i].healthPointsCurrent +
                                    "/" +
                                    charData[i].healthpoints +
                                    "</div>" +
                                    "<div class='stamina'>ST:" +
                                    charData[i].staminaPointsCurrent +
                                    "/" +
                                    charData[i].staminapoints +
                                    "</div>" +
                                    "</div>" +
                                    "<div class='thirdrow'><div>" +
                                    charData[i].type +
                                    "</div></div>" +
                                    "<div class='fourthrow'><div>" +
                                    charData[i].skill_name +
                                    ": " +
                                    charData[i].skill_desc +
                                    "</div></div>" +
                                    "<div class='rightrow'><table class='table-bordered'>" +
                                    "<tr><td class='firstTD'>ATK:</td><td>" +
                                    atk +
                                    "</td></tr>" +
                                    "<tr><td class='firstTD'>DEF:</td><td>" +
                                    def +
                                    "</td></tr>" +
                                    "<tr><td class='firstTD'>SPE:</td><td>" +
                                    spe +
                                    "</td></tr>" +
                                    "</table></div></div>" +
                                    "<div class='moverow'><table class='table-bordered'><th>Type</th><th>Name</th><th>Description</th><th>Power</th><th>Accuracy</th><th>Cost</th>" +
                                    moveDiv +
                                    "</table></div></div>"
                            );
                        });

                        $("#characterList").children().slice(12).css({
                            "background-color": "black",
                            color: "white",
                        });
                        //reset sort
                        $(".buttonPos")
                            .children()
                            .removeClass("btn-danger")
                            .addClass("btn-success")
                            .html("Sort");
                        positionArray = [];
                    } else {
                        //TODO proper error logging
                    }
                });
            }
        } else if (positionArray.length > 2) {
            $(".buttonPos")
                .children()
                .removeClass("btn-danger")
                .addClass("btn-success")
                .html("Sort");
            positionArray = [];
        }
    });

    $(".buyButton").on("click", function () {
        $("#buyModal").modal("show");
        var shopId = $("#shopModal")
            .children()
            .children()
            .children()
            .first()
            .attr("data-id");
        //show buy modal with data
        values = {
            shopId: shopId,
            user: user,
        };
        getdetails("/play/getBuyData", values).done(function (response) {
            if (response.success !== undefined) {
                let itemList = response.success;
                var shopDiv = "";
                $("#shopBuyList").empty();
                $.each(itemList, function (i) {
                    let img =
                        "/sprites/items/" + itemList[i].name + "/sprite.png";

                    shopDiv +=
                        "<tbody><tr class='itemFrame'><td><img class='itemImg' src='" +
                        img +
                        "'></td>" +
                        "<td>" +
                        itemList[i].name +
                        "</td>" +
                        "<td>" +
                        itemList[i].description +
                        "</td>" +
                        "<td>" +
                        itemList[i].buyPrice +
                        "</td>" +
                        "<td><input type='number' class='itemBuyNum'><button id='" +
                        itemList[i].id +
                        "'class='btn-success btn btn-default buyItemButton'>Buy</button></td></tr>";
                });

                $("#shopBuyList").append(
                    "Balance: " +
                        response.balance.balance +
                        "<table class='table-bordered'>" +
                        "<th></th>" +
                        "<th>Name</th>" +
                        "<th>Description</th>" +
                        "<th>Buy price</th>" +
                        "<tbody>" +
                        shopDiv +
                        "</tbody></table>"
                );
            }
        });
    });

    $(".sellButton").on("click", function () {
        $("#sellModal").modal("show");
        var shopId = $("#shopModal")
            .children()
            .children()
            .children()
            .first()
            .attr("data-id");
        //use user inventory to sell items and get money
        values = {
            user: user,
        };
        getdetails("/play/getSellData", values).done(function (response) {
            if (response.success !== undefined) {
                let itemList = response.success;
                var shopDiv = "";
                $("#shopSellList").empty();
                $.each(itemList, function (i) {
                    let img =
                        "/sprites/items/" + itemList[i].name + "/sprite.png";

                    shopDiv +=
                        "<tbody><tr class='itemFrame'><td><img class='itemImg' src='" +
                        img +
                        "'></td>" +
                        "<td>" +
                        itemList[i].name +
                        "</td>" +
                        "<td>" +
                        itemList[i].description +
                        "</td>" +
                        "<td>" +
                        itemList[i].stock +
                        "</td>" +
                        "<td>" +
                        itemList[i].sellPrice +
                        "</td>" +
                        "<td><input type='number' max='" +
                        itemList[i].stock +
                        "' class='itemBuyNum'><button id='" +
                        itemList[i].name +
                        "'class='btn-success btn btn-default sellItemButton'>Sell</button></td></tr>";
                });

                $("#shopSellList").append(
                    "Balance: " +
                        response.balance.balance +
                        "<table class='table-bordered'>" +
                        "<th></th>" +
                        "<th>Name</th>" +
                        "<th>Desc</th>" +
                        "<th>Stock</th>" +
                        "<th>Sell price</th>" +
                        "<tbody>" +
                        shopDiv +
                        "</tbody></table>"
                );
            }
        });
    });

    $(document).on("click", ".buyItemButton", function () {
        let numberOfItems = this.previousElementSibling.value;
        if (numberOfItems !== "") {
            //buy item
            values = {
                user: user,
                stock: numberOfItems,
                item: this.id,
            };

            getdetails("/play/buyItem", values).done(function (response) {
                if (response.success !== undefined) {
                    //reset shop so balance is updated
                    var shopId = $("#shopModal")
                        .children()
                        .children()
                        .children()
                        .first()
                        .attr("data-id");
                    values = {
                        user: user,
                        shopId: shopId,
                    };
                    getdetails("/play/getBuyData", values).done(function (
                        response
                    ) {
                        if (response.success !== undefined) {
                            let itemList = response.success;
                            var shopDiv = "";
                            $("#shopBuyList").empty();
                            $.each(itemList, function (i) {
                                let img =
                                    "/sprites/items/" +
                                    itemList[i].name +
                                    "/sprite.png";

                                shopDiv +=
                                    "<tbody><tr class='itemFrame'><td><img class='itemImg' src='" +
                                    img +
                                    "'></td>" +
                                    "<td>" +
                                    itemList[i].name +
                                    "</td>" +
                                    "<td>" +
                                    itemList[i].description +
                                    "</td>" +
                                    "<td>" +
                                    itemList[i].buyPrice +
                                    "</td>" +
                                    "<td><input type='number' class='itemBuyNum'><button id='" +
                                    itemList[i].id +
                                    "'class='btn-success btn btn-default buyItemButton'>Buy</button></td></tr>";
                            });

                            $("#shopBuyList").append(
                                "Balance: " +
                                    response.balance.balance +
                                    "<table class='table-bordered'>" +
                                    "<th></th>" +
                                    "<th>Name</th>" +
                                    "<th>Description</th>" +
                                    "<th>Buy price</th>" +
                                    "<tbody>" +
                                    shopDiv +
                                    "</tbody></table>"
                            );
                        }
                    });
                } else {
                    //TODO proper error logging
                }
            });
        }
    });

    $(document).on("click", ".sellItemButton", function () {
        let numberOfItems = this.previousElementSibling.value;
        if (numberOfItems !== "") {
            //buy item
            values = {
                user: user,
                stock: numberOfItems,
                item: this.id,
            };

            getdetails("/play/sellItem", values).done(function (response) {
                if (response.success !== undefined) {
                    //reset inventory so balance is updated
                    var shopId = $("#shopModal")
                        .children()
                        .children()
                        .children()
                        .first()
                        .attr("data-id");
                    values = {
                        user: user,
                        shopId: shopId,
                    };
                    getdetails("/play/getSellData", values).done(function (
                        response
                    ) {
                        if (response.success !== undefined) {
                            let itemList = response.success;
                            var shopDiv = "";
                            $("#shopSellList").empty();
                            $.each(itemList, function (i) {
                                let img =
                                    "/sprites/items/" +
                                    itemList[i].name +
                                    "/sprite.png";

                                shopDiv +=
                                    "<tbody><tr class='itemFrame'><td><img class='itemImg' src='" +
                                    img +
                                    "'></td>" +
                                    "<td>" +
                                    itemList[i].name +
                                    "</td>" +
                                    "<td>" +
                                    itemList[i].description +
                                    "</td>" +
                                    "<td>" +
                                    itemList[i].stock +
                                    "</td>" +
                                    "<td>" +
                                    itemList[i].sellPrice +
                                    "</td>" +
                                    "<td><input type='number' class='itemBuyNum'><button id='" +
                                    itemList[i].name +
                                    "'class='btn-success btn btn-default sellItemButton'>Sell</button></td></tr>";
                            });

                            $("#shopSellList").append(
                                "Balance: " +
                                    response.balance.balance +
                                    "<table class='table-bordered'>" +
                                    "<th></th>" +
                                    "<th>Name</th>" +
                                    "<th>Desc</th>" +
                                    "<th>Stock</th>" +
                                    "<th>Sell price</th>" +
                                    "<tbody>" +
                                    shopDiv +
                                    "</tbody></table>"
                            );
                        }
                    });
                } else {
                    //TODO proper error logging
                }
            });
        }
    });

    $(document).on("click", ".itemUse", function () {
        //open modal similar to characters and give option to use item on them
        $("#itemUseModal").modal("show");
        values = {
            user: user,
        };
        var id = this.id;
        getdetails("/play/getCharacterRoster", values).done(function (
            response
        ) {
            if (response.success !== undefined) {
                charData = response.success;
                //clear div
                $("#itemUseList").html("");
                //append data to div
                $.each(charData, function (i) {
                    //get sprite id
                    let img =
                        "/sprites/characters/" +
                        charData[i].char_name +
                        "/sprite.png";
                    let exp = charData[i].exp - (charData[i].exp / 1000) * 1000;
                    let lvl = charData[i].exp / 1000;

                    $("#itemUseList").append(
                        "<div class='itemPos' id='" +
                            charData[i].position +
                            "'><button value='" +
                            charData[i].position +
                            "' id='" +
                            id +
                            "' class='float-right btn btn-default btn-success useItemButton'>Use</button></div>"
                    );
                    $("#itemUseList").append(
                        "<div class=cont><div class='leftrow'>" +
                            "<img class='spriteImg' src='" +
                            img +
                            "'>" +
                            "<div class='toprow'><div class='charName'>" +
                            charData[i].char_name +
                            "<div class='charLevel'>Lv." +
                            lvl +
                            "<div class='exp'>Exp:" +
                            exp +
                            "/1000</div>" +
                            "</div></div></div>" +
                            "<div class='middlerow'><div class='health'>HP:" +
                            charData[i].healthPointsCurrent +
                            "/" +
                            charData[i].healthpoints +
                            "</div>" +
                            "<div class='stamina'>ST:" +
                            charData[i].staminaPointsCurrent +
                            "/" +
                            charData[i].staminapoints +
                            "</div>" +
                            "</div>" +
                            "<div class='thirdrow'><div>" +
                            charData[i].type +
                            "</div></div>" +
                            "<div class='fourthrow'><div>" +
                            charData[i].skill_name +
                            ": " +
                            charData[i].skill_desc +
                            "</div></div>"
                    );
                });
            } else {
                //TODO proper error logging
            }
        });
    });

    $(document).on("click", ".useItemButton", function () {
        //use item on specific character, check if the item usage benefits them, and if so, delete the item from the inventory stock
        values = {
            user: user,
            itemId: this.id,
            position: this.parentElement.id,
        };
        var id = this.id;
        getdetails("/play/useItem", values).done(function (response) {
            if (response.success !== undefined) {
                //reload character modal with updated values
                values = {
                    user: user,
                };
                getdetails("/play/getCharacterRoster", values).done(function (
                    response
                ) {
                    if (response.success !== undefined) {
                        charData = response.success;
                        //clear div
                        $("#itemUseList").empty();
                        //append data to div
                        $.each(charData, function (i) {
                            //get sprite id
                            let img =
                                "/sprites/characters/" +
                                charData[i].char_name +
                                "/sprite.png";
                            let exp =
                                charData[i].exp -
                                (charData[i].exp / 1000) * 1000;
                            let lvl = charData[i].exp / 1000;

                            $("#itemUseList").append(
                                "<div class='itemPos' id='" +
                                    charData[i].position +
                                    "'><button value='" +
                                    charData[i].position +
                                    "' id='" +
                                    id +
                                    "' class='float-right btn btn-default btn-success useItemButton'>Use</button></div>"
                            );
                            $("#itemUseList").append(
                                "<div class=cont><div class='leftrow'>" +
                                    "<img class='spriteImg' src='" +
                                    img +
                                    "'>" +
                                    "<div class='toprow'><div class='charName'>" +
                                    charData[i].char_name +
                                    "<div class='charLevel'>Lv." +
                                    lvl +
                                    "<div class='exp'>Exp:" +
                                    exp +
                                    "/1000</div>" +
                                    "</div></div></div>" +
                                    "<div class='middlerow'><div class='health'>HP:" +
                                    charData[i].healthPointsCurrent +
                                    "/" +
                                    charData[i].healthpoints +
                                    "</div>" +
                                    "<div class='stamina'>ST:" +
                                    charData[i].staminaPointsCurrent +
                                    "/" +
                                    charData[i].staminapoints +
                                    "</div>" +
                                    "</div>" +
                                    "<div class='thirdrow'><div>" +
                                    charData[i].type +
                                    "</div></div>" +
                                    "<div class='fourthrow'><div>" +
                                    charData[i].skill_name +
                                    ": " +
                                    charData[i].skill_desc +
                                    "</div></div>"
                            );
                        });
                    } else {
                        //TODO proper error logging
                    }
                });
            } else {
                //TODO proper error logging
            }
        });
    });

    $("#itemUseModal").on("hide.bs.modal", function () {
        //reload items modal so item quantity updates
        values = {
            user: user,
        };
        getdetails("/play/getItems", values).done(function (response) {
            if (response.success !== undefined) {
                let itemList = response.success;
                var itemDiv = "";
                $("#itemsDiv").empty();
                $.each(itemList, function (i) {
                    let img =
                        "/sprites/items/" + itemList[i].name + "/sprite.png";
                    let useButton =
                        itemList[i].category !== "battle_item"
                            ? "<button id='" +
                              itemList[i].id +
                              "'class='btn-success btn btn-default itemUse'>Use</button>"
                            : "";

                    itemDiv +=
                        "<tbody><tr class='itemFrame'><td><img class='itemImg' src='" +
                        img +
                        "'></td>" +
                        "<td>" +
                        itemList[i].name +
                        "</td>" +
                        "<td>" +
                        itemList[i].desc +
                        "</td>" +
                        "<td>" +
                        itemList[i].stock +
                        "</td>" +
                        "<td>" +
                        useButton +
                        "</td></tr>";
                });

                $("#itemsDiv").append(
                    "<table class='table-bordered'>" +
                        "<th></th>" +
                        "<th>Name</th>" +
                        "<th>Desc</th>" +
                        "<th>Stock</th>" +
                        "<tbody>" +
                        itemDiv +
                        "</tbody></table>"
                );
            }
        });
    });

    $("#shopModal").on("hide.bs.modal", function () {
        processEvent(21);
    });

    $(document).on("click", ".genderButton", function () {
        if (this.id === "femaleSprite") {
            values.sprite = "F";
        } else {
            values.sprite = "M";
        }
        values.user = user;

        getdetails("/play/chooseSprite", values).done(function (response) {
            if (response.success !== undefined) {
                $(".genderButton").remove();
            }
        });
    });

    function getBattleData(trainerId, rivalId) {
        //receive battlers id, return two arrays with all the data
        values = {
            trainer: trainerId,
            rival: rivalId,
        };
        getdetails("/play/getBattleData", values).done(function (response) {
            if (response.success !== undefined) {
                trainerData = response.success[0];
                rivalData = response.success[1];

                startBattle();
            } else {
                //TODO proper error logging
            }
        });
    }

    function startBattle() {
        //create all the non-dynamic elements
        $("#playField").attr("hidden", "true");
        $("#battlePlayfield").removeAttr("hidden");
        $("#buttonBar").attr("hidden", "true");
        //append non-specific sprites, trainer char position, rival char position, UI with the battle info for each
        //append playfield buttons which we'll be toggling each turn and which open modals
        //this is the function for the first turn of the battle
        //show start battle text

        switch (rivalData[0].data.owner) {
            case "#rival_1":
                $("#battleText")
                    .html("Marisa has challenged you to a battle!")
                    .fadeToggle(2000, function () {
                        $("#battleText")
                            .empty()
                            .html(
                                turnBasedSkills(
                                    trainerData[0].data.skill_id,
                                    trainerData[0]
                                )
                            )
                            .fadeToggle(2000, function () {
                                $("#battleText")
                                    .empty()
                                    .html(
                                        turnBasedSkills(
                                            rivalData[0].data.skill_id,
                                            rivalData[0]
                                        )
                                    )
                                    .fadeToggle(2000, function () {
                                        $("#buttonBar").removeAttr("hidden");
                                        //ready for turn 1
                                    });
                            });
                    });
                //start battle
                //append
                //check skills that are turn-based or one-time
                //because they all are triggered at the same time, we call them on a function
                reloadBattleData();

                break;
            case "#route1_trainer1":
                $("#battleText")
                    .html("Ace Trainer Mauricio challenges you!")
                    .fadeToggle(2000, function () {
                        $("#battleText")
                            .empty()
                            .html(
                                turnBasedSkills(
                                    trainerData[0].data.skill_id,
                                    trainerData[0]
                                )
                            )
                            .fadeToggle(2000, function () {
                                $("#battleText")
                                    .empty()
                                    .html(
                                        turnBasedSkills(
                                            rivalData[0].data.skill_id,
                                            rivalData[0]
                                        )
                                    )
                                    .fadeToggle(2000, function () {
                                        $("#buttonBar").removeAttr("hidden");
                                        //ready for turn 1
                                    });
                            });
                    });

                reloadBattleData();

                break;
            case "#gymleader_1":
                $("#battleText")
                    .html("Gym Leader Aya challenges you!")
                    .fadeToggle(2000, function () {
                        $("#battleText")
                            .empty()
                            .html(
                                turnBasedSkills(
                                    trainerData[0].data.skill_id,
                                    trainerData[0]
                                )
                            )
                            .fadeToggle(2000, function () {
                                $("#battleText")
                                    .empty()
                                    .html(
                                        turnBasedSkills(
                                            rivalData[0].data.skill_id,
                                            rivalData[0]
                                        )
                                    )
                                    .fadeToggle(2000, function () {
                                        $("#buttonBar").removeAttr("hidden");
                                        //ready for turn 1
                                    });
                            });
                    });

                reloadBattleData();

                break;
            default:
                $("#battleText")
                    .html("Wild " + rivalData[0].data.char_name + " appears!")
                    .fadeToggle(2000, function () {
                        $("#battleText")
                            .empty()
                            .html(
                                turnBasedSkills(
                                    trainerData[0].data.skill_id,
                                    trainerData[0]
                                )
                            )
                            .fadeToggle(2000, function () {
                                $("#battleText")
                                    .empty()
                                    .html(
                                        turnBasedSkills(
                                            rivalData[0].data.skill_id,
                                            rivalData[0]
                                        )
                                    )
                                    .fadeToggle(2000, function () {
                                        $("#buttonBar").removeAttr("hidden");
                                        //ready for turn 1
                                    });
                            });
                    });
                reloadBattleData();
                break;
        }
    }

    $("#atkBtn").on("click", function () {
        //open attack list modal
        $("#atkBattleModal").modal("show");
        $(".atkCommand").remove();

        //fill atk modal
        let j = 1;
        for (let i = 0; i <= 4; i++) {
            if (trainerData[0].moves[i] !== undefined) {
                //assign to button
                $("#atkBtn" + j).append(
                    "<button class='atkCommand btn btn-default btn-lg' data-position='" +
                        i +
                        "' id='" +
                        trainerData[0].moves[i].id +
                        "'>" +
                        trainerData[0].moves[i].name +
                        "<br>" +
                        trainerData[0].moves[i].type +
                        "<br> Cost:" +
                        trainerData[0].moves[i].cost +
                        "    </button>"
                );
            }
        }
    });

    $("#itemBtn").on("click", function () {
        //open items list modal
        $("#itemsModal").modal("show"); //reusage of modal :(
        //fill items modal with battle items
        values = {
            user: user,
        };
        getdetails("/play/getItems", values).done(function (response) {
            if (response.success !== undefined) {
                let itemList = response.success;
                var itemDiv = "";
                $("#itemsDiv").empty();
                $.each(itemList, function (i) {
                    let img =
                        "/sprites/items/" + itemList[i].name + "/sprite.png";
                    if (combatType !== "trainer" && itemList[i].id === 1) {
                        //allow usage of capture device only if its not a trainer battle
                        useButton =
                            "<button id='" +
                            itemList[i].id +
                            "' class='btn-success btn btn-default itemBattleUse'>Use</button>";
                    } else {
                        if (itemList[i].id !== 1) {
                            useButton =
                                "<button id='" +
                                itemList[i].id +
                                "' class='btn-success btn btn-default itemBattleUse'>Use</button>";
                        } else {
                            useButton = "";
                        }
                    }

                    itemDiv +=
                        "<tbody><tr class='itemFrame'><td><img class='itemImg' src='" +
                        img +
                        "'></td>" +
                        "<td>" +
                        itemList[i].name +
                        "</td>" +
                        "<td>" +
                        itemList[i].desc +
                        "</td>" +
                        "<td>" +
                        itemList[i].stock +
                        "</td>" +
                        "<td>" +
                        useButton +
                        "</td></tr>";
                });

                $("#itemsDiv").append(
                    "<table class='table-bordered'>" +
                        "<th></th>" +
                        "<th>Name</th>" +
                        "<th>Desc</th>" +
                        "<th>Stock</th>" +
                        "<tbody>" +
                        itemDiv +
                        "</tbody></table>"
                );
            }
        });
    });

    $("#charBtn").on("click", function () {
        //open character list modal
        $("#charBattleModal").modal("show");
        $("#charList").html("");
        //append data to div
        $.each(trainerData, function (i) {
            //get sprite id
            let img =
                "/sprites/characters/" +
                trainerData[i].data.char_name +
                "/sprite.png";
            let lvl = trainerData[i].data.level;

            var moveDiv = "";
            $.each(trainerData[i].moves, function (j) {
                moveDiv +=
                    "<tr><td>" +
                    trainerData[i].moves[j].type +
                    "</td><td>" +
                    trainerData[i].moves[j].name +
                    "</td><td>" +
                    trainerData[i].moves[j].description +
                    "</td><td>" +
                    trainerData[i].moves[j].power +
                    "</td><td>" +
                    trainerData[i].moves[j].accuracy +
                    "</td><td>" +
                    trainerData[i].moves[j].cost +
                    "</td>";
            });

            $("#charList").append(
                "<div class='charCommand' id='" +
                    trainerData[i].data.position +
                    "'><button value='" +
                    trainerData[i].data.position +
                    "' class='float-right btn btn-default btn-success'>Change</button></div>"
            );
            $("#charList").append(
                "<div class=cont><div class='leftrow'>" +
                    "<img class='spriteImg' src='" +
                    img +
                    "'>" +
                    "<div class='toprow'><div class='charName'>" +
                    trainerData[i].data.char_name +
                    "<div class='charLevel'>Lv." +
                    lvl +
                    "</div></div></div>" +
                    "<div class='middlerow'><div class='health'>HP:" +
                    trainerData[i].data.healthPoints +
                    "/" +
                    trainerData[i].data.maxHealth +
                    "</div>" +
                    "<div class='stamina'>ST:" +
                    trainerData[i].data.staminaPoints +
                    "/" +
                    trainerData[i].data.maxStamina +
                    "</div>" +
                    "</div>" +
                    "<div class='thirdrow'><div>" +
                    trainerData[i].data.type +
                    "</div></div>" +
                    "<div class='fourthrow'><div>" +
                    trainerData[i].data.skill_name +
                    ": " +
                    trainerData[i].data.skill_desc +
                    "</div></div>" +
                    "<div class='moverow'><table class='table-bordered'><th>Type</th><th>Name</th><th>Description</th><th>Power</th><th>Accuracy</th><th>Cost</th>" +
                    moveDiv +
                    "</table></div></div>"
            );
        });
    });

    $("#escBtn").on("click", function () {
        if (combatType !== "trainer") {
            finishBattle(trainerData, "null");
        } else {
            //show in textbox that you cant escape from a trainer battle
            $("#buttonBar")
                .attr("hidden", "true")
                .fadeToggle(100, function () {
                    $("#battleText")
                        .html("You can't escape a trainer battle!")
                        .fadeToggle(2000, function () {
                            $("#battleText").html("");
                            $("#buttonBar").removeAttr("hidden");
                        });
                });
        }
    });

    $(document).on("click", ".atkCommand", function () {
        userAction = "attack";
        idAction = [this.id, this.dataset.position];
        $("#atkBattleModal").modal("hide");
        processBattleTurn(userAction, idAction);
        //using an attack command spends the turn, calling process turn, processing the command
    });

    $(document).on("click", ".itemBattleUse", function () {
        //open characters modal from array
        //fill with array
        var id = this.id;
        //check if its capturing device
        if (this.id == 1) {
            $("#itemsModal").modal("hide");
            $("#itemUseList").html("");
            $("#buttonBar").attr("hidden", "true");

            //calculations for capture
            var chance = Math.floor(Math.random() * 100);
            if (chance > 0) {
                //captured
                $("#battleText")
                    .html("Captured successfully!")
                    .fadeToggle(2000, function () {
                        values = {
                            user: user,
                            rivalId: rivalData[0].data.owner,
                        };
                        getdetails("/play/getCapturedChar", values).done(
                            function (response) {
                                if (response.success !== undefined) {
                                    captured = true;
                                    finishBattle();
                                }
                            }
                        );
                    });
            } else {
                //proceed with turn
                $("#battleText")
                    .html("Failed to capture!")
                    .fadeToggle(2000, function () {
                        processBattleTurn("item", "");
                    });
            }
        } else {
            $("#itemUseModal").modal("show");
            $("#itemUseList").html("");
            //append data to div
            $.each(trainerData, function (i) {
                //get sprite id
                let img =
                    "/sprites/characters/" +
                    trainerData[i].data.char_name +
                    "/sprite.png";
                let lvl = trainerData[i].data.level;

                $("#itemUseList").append(
                    "<div class='itemPos' id='" +
                        trainerData[i].data.position +
                        "'><button value='" +
                        trainerData[i].data.position +
                        "' id='" +
                        id +
                        "' class='float-right btn btn-default btn-success itemCommand'>Use</button></div>"
                );
                $("#itemUseList").append(
                    "<div class=cont><div class='leftrow'>" +
                        "<img class='spriteImg' src='" +
                        img +
                        "'>" +
                        "<div class='toprow'><div class='charName'>" +
                        trainerData[i].data.char_name +
                        "<div class='charLevel'>Lv." +
                        lvl +
                        "</div></div></div>" +
                        "<div class='middlerow'><div class='health'>HP:" +
                        trainerData[i].data.healthPoints +
                        "/" +
                        trainerData[i].data.maxHealth +
                        "</div>" +
                        "<div class='stamina'>ST:" +
                        trainerData[i].data.staminaPoints +
                        "/" +
                        trainerData[i].data.maxStamina +
                        "</div>" +
                        "</div>" +
                        "<div class='thirdrow'><div>" +
                        trainerData[i].data.type +
                        "</div></div>" +
                        "<div class='fourthrow'><div>" +
                        trainerData[i].data.skill_name +
                        ": " +
                        trainerData[i].data.skill_desc +
                        "</div></div>"
                );
            });
        }
    });

    $(document).on("click", ".itemCommand", function () {
        //use item, spend command
        var itemId = parseInt(this.id);
        var position = parseInt(this.parentElement.id);
        //there are several types of items, so we'll leave open other kinds of checking
        switch (itemId) {
            case 2:
                "heal 20 hp";
                //check hp
                if (
                    trainerData[position].data.healthPoints !==
                    trainerData[position].data.maxHealth
                ) {
                    var leftToMax =
                        trainerData[position].data.maxHealth -
                        trainerData[position].data.healthPoints;
                    var heal = 20;
                    if (leftToMax < heal) {
                        heal -= leftToMax;
                    }
                    //give hp
                    trainerData[position].data.healthPoints += heal;
                    //process turn
                    $("#itemUseModal").modal("hide").empty();
                    $("#itemsModal").modal("hide").empty();
                    userAction = "item";
                    idAction = "Potion";
                    reloadBattleData();
                    processBattleTurn(userAction, idAction);
                }
                break;
            case 3:
                "heal 50 hp";
                //check hp, it is repeated code, but consider if we had 20 types of items, each with their own special effects, making an automated function for what seems to be 4 items at most is not so important
                if (
                    trainerData[position].data.healthPoints !==
                    trainerData[position].data.maxHealth
                ) {
                    var leftToMax =
                        trainerData[position].data.maxHealth -
                        trainerData[position].data.healthPoints;
                    var heal = 20;
                    if (leftToMax < heal) {
                        heal -= leftToMax;
                    }
                    //give hp
                    trainerData[position].data.healthPoints += heal;
                    //process turn
                    $("#itemUseModal").modal("hide").empty();
                    $("#itemsModal").modal("hide").empty();
                    userAction = "item";
                    idAction = "Super Potion";
                    reloadBattleData();
                    processBattleTurn(userAction, idAction);
                    //notice that we only process this line if the item can actually be used on the character
                }
                break;
        }
    });

    $(document).on("click", ".charCommand", function () {
        $("#charBattleModal").modal("hide");
        var newChar = this.id;
        $("#battleText").html(
            "Great job, " + trainerData[0].data.char_name + "!"
        );
        trainerData.swap(newChar, 0);
        $("#buttonBar").attr("hidden", "true");
        $("#battleText").fadeToggle(2000, function () {
            $("#battleText")
                .empty()
                .html("Let's do this, " + trainerData[0].data.char_name + "!")
                .fadeToggle(2000, function () {
                    reloadBattleData();
                    if (fainted === false) {
                        userAction = "change";
                        idAction = "";
                        processBattleTurn(userAction, idAction);
                    } else {
                        $("#buttonBar").show(); //turn ended
                    }
                });
            //reload data
        });
    });

    function typeWeakness(typeAtk, typeDef) {
        switch (typeAtk) {
            case "Normal":
                switch (typeDef) {
                    case "Dark":
                        return 0.75;
                    default:
                        return 1;
                }

            case "Poison":
                switch (typeDef) {
                    case "Dark":
                        return 1.25;
                    default:
                        return 1;
                }

            case "Dark":
                switch (typeDef) {
                    case "Normal":
                        return 1.25;
                    case "Poison":
                        return 0.75;
                    default:
                        return 1;
                }

            case "Flying":
                switch (typeDef) {
                    case "Electric":
                        return 0.75;
                    default:
                        return 1;
                }

            case "Electric":
                switch (typeDef) {
                    case "Flying":
                        return 0.75;
                    default:
                        return 1;
                }
        }
    }

    function switchFaintedChar() {
        $("#charBattleModal").modal("show");
        $("#charList").html("");
        fainted = true;
        //append data to div
        $.each(trainerData, function (i) {
            //get sprite id
            let img =
                "/sprites/characters/" +
                trainerData[i].data.char_name +
                "/sprite.png";
            let lvl = trainerData[i].data.level;

            var moveDiv = "";
            $.each(trainerData[i].moves, function (j) {
                moveDiv +=
                    "<tr><td>" +
                    trainerData[i].moves[j].type +
                    "</td><td>" +
                    trainerData[i].moves[j].name +
                    "</td><td>" +
                    trainerData[i].moves[j].description +
                    "</td><td>" +
                    trainerData[i].moves[j].power +
                    "</td><td>" +
                    trainerData[i].moves[j].accuracy +
                    "</td><td>" +
                    trainerData[i].moves[j].cost +
                    "</td>";
            });

            $("#charList").append(
                "<div class='charCommand' id='" +
                    trainerData[i].data.position +
                    "'><button value='" +
                    trainerData[i].data.position +
                    "' class='float-right btn btn-default btn-success'>Change</button></div>"
            );
            $("#charList").append(
                "<div class=cont><div class='leftrow'>" +
                    "<img class='spriteImg' src='" +
                    img +
                    "'>" +
                    "<div class='toprow'><div class='charName'>" +
                    trainerData[i].data.char_name +
                    "<div class='charLevel'>Lv." +
                    lvl +
                    "</div></div></div>" +
                    "<div class='middlerow'><div class='health'>HP:" +
                    trainerData[i].data.healthPoints +
                    "/" +
                    trainerData[i].data.maxHealth +
                    "</div>" +
                    "<div class='stamina'>ST:" +
                    trainerData[i].data.staminaPoints +
                    "/" +
                    trainerData[i].data.maxStamina +
                    "</div>" +
                    "</div>" +
                    "<div class='thirdrow'><div>" +
                    trainerData[i].data.type +
                    "</div></div>" +
                    "<div class='fourthrow'><div>" +
                    trainerData[i].data.skill_name +
                    ": " +
                    trainerData[i].data.skill_desc +
                    "</div></div>" +
                    "<div class='moverow'><table class='table-bordered'><th>Type</th><th>Name</th><th>Description</th><th>Power</th><th>Accuracy</th><th>Cost</th>" +
                    moveDiv +
                    "</table></div></div>"
            );
        });
    }

    function checkSupportAttack(moveId, attackerId) {
        //check id of support attacks and act accordingly
        switch (moveId) {
            case 2:
                //raise self defense by 1
                attackerId === "user"
                    ? (trainerData[0].data.def += 1)
                    : rivalData[0].data.def;
                return "'s defense raised by 1.";
            case 4:
                //speed +1
                attackerId === "user"
                    ? (trainerData[0].data.speed += 1)
                    : rivalData[0].data.speed;
                return "'s speed raised by 1.";
            case 8:
                //reduces enemy speed by 1
                attackerId === "user"
                    ? (rivalData[0].data.speed -= 1)
                    : (trainerData[0].data.speed -= 1);
                return "'s defense raised by 1.";
            case 11:
                //raise all stats by 1
                if (attackerId === "user") {
                    trainerData[0].data.atk += 1;
                    trainerData[0].data.def += 1;
                    trainerData[0].data.speed += 1;
                } else {
                    rivalData[0].data.atk += 1;
                    rivalData[0].data.def += 1;
                    rivalData[0].data.speed += 1;
                }
                return "'s stats raised";
            case 13:
                //restore 50% health
                attackerId === "user"
                    ? (trainerData[0].data.healthPoints +=
                          (trainerData[0].data.healthPoints * 50) / 100)
                    : (rivalData[0].data.healthPoints +=
                          (rivalData[0].data.healthPoints * 50) / 100);
                return "'s health restored.";
        }
    }

    function finishBattle(trainerData, result) {
        //check finish of the battle and result
        if (result === "lose") {
            //uh oh u lost
            $("#battleText")
                .html("You lost!")
                .fadeToggle(2000, function () {
                    if (rivalData[0].data.owner === "#rival_1") {
                        //only battle where losing is allowed
                        //trigger conversation
                        $("#playField").attr("hidden", "true");
                        $("#battlePlayfield").removeAttr("hidden");
                        $("#buttonBar").attr("hidden", "true");
                        values = {
                            user: user,
                            conversationId: 7,
                        };
                        startConversation(values);
                    } else {
                        window.location.reload();
                    }
                });
        } else if (result === "win") {
            //you win epic
            //update new stats
            values = {
                user: user,
                data: trainerData,
            };
            getdetails("/play/updateData", values).done(function (response) {
                if (response.success !== undefined) {
                    $("#battleText")
                        .html("You win!")
                        .fadeToggle(2000, function () {
                            $("#battlePlayfield").attr("hidden", "true");
                            $("#playField").removeAttr("hidden");
                            $("#buttonBar").attr("hidden", "true");
                            switch (rivalData[0].data.owner) {
                                case "#rival_1":
                                    //trigger conversation
                                    values = {
                                        user: user,
                                        conversationId: 8,
                                    };
                                    startConversation(values);
                                    break;
                                case "#route1_trainer1":
                                    //trigger conversation
                                    values = {
                                        user: user,
                                        conversationId: 12,
                                    };
                                    startConversation(values);
                                    break;
                                case "#gymleader_1":
                                    //trigger conversation
                                    values = {
                                        user: user,
                                        conversationId: 21,
                                    };
                                    startConversation(values);
                                    break;
                                default:
                                    //TODO what
                                    break;
                            }
                        });
                } else {
                    //TODO what
                }
            });
        } else {
            //wild battle
            if (captured === false) {
                //delete temporary character
                values = {
                    tempUser: rivalData[0].data.owner,
                };
                getdetails("/play/deleteTempChar", values).done(function (
                    response
                ) {
                    if (response.success !== undefined) {
                    }
                });
            }
            $("#battlePlayfield").attr("hidden", "true");
            $("#playField").removeAttr("hidden");
            $("#buttonBar").attr("hidden", "true");
            controlEnvironment = "field";
        }
    }

    function attackProcess(attackerId, positionId) {
        if (attackerId === "user") {
            //our turn
            //atk formula: userattack+atkPow*(100/(100+rivaldefense))
            //check if its a power-based attack
            if (trainerData[0].moves[positionId].power > 0) {
                var attackFormula =
                    trainerData[0].data.atk +
                    trainerData[0].moves[positionId].power *
                        (100 / (100 + rivalData[0].data.def));
                //check STAB and type
                if (
                    trainerData[0].data.type ===
                    trainerData[0].moves[positionId].type
                ) {
                    attackFormula *= 1.25;
                }
                //type weakness chart
                attackFormula *= typeWeakness(
                    trainerData[0].moves[positionId].type,
                    rivalData[0].data.type
                ); // returns type multiplier
                attackFormula = Math.floor(attackFormula / 2);
                //formula finished, now we check acc
                var accuracy = trainerData[0].moves[positionId].accuracy;
                //get random number, if its higher than accuracy, move fails, easy
                var hits = Math.floor(Math.random() * 100);
                if (hits > accuracy) {
                    $("#battleText")
                        .html("Attack failed!")
                        .fadeToggle(2000, function () {
                            $("#battleText").html("");
                        });
                    return true;
                } else {
                    //hit
                    trainerData[0].data.staminaPoints -=
                        trainerData[0].moves[positionId].cost;
                    //check if its THAT skill
                    if (trainerData[0].moves[positionId].id == 9) {
                        rivalData[0].data.healthPoints = 0;
                        $("#battleText").html(
                            "The judgment has been casted. Sentence is death."
                        );
                    } else if (
                        rivalData[0].data.healthPoints - attackFormula <
                        0
                    ) {
                        rivalData[0].data.healthPoints = 0;
                    } else {
                        rivalData[0].data.healthPoints -= attackFormula;
                    }
                    //check if rival's dead
                    if (rivalData[0].data.healthPoints <= 0) {
                        //give exp
                        if (combatType === "trainer") {
                            //500exp
                            trainerData[0].data.exp += 500;
                        } else {
                            trainerData[0].data.exp += 100;
                        }

                        if (rivalData[1] === undefined) {
                            //no one else left, finish battle
                            //call finish battle function TODO
                            reloadBattleData();
                            finishBattle(trainerData, "win");
                        } else {
                            //release next character
                            rivalData.shift();
                            reloadBattleData();
                            return false;
                        }
                    } else {
                        reloadBattleData();
                        return true;
                    }
                }
            } else {
                var accuracy = trainerData[0].moves[positionId].accuracy;
                //get random number, if its higher than accuracy, move fails, easy
                var hits = Math.floor(Math.random() * 100);
                if (hits > accuracy) {
                    $("#battleText").html("Attack failed!");
                    return true;
                } else {
                    let html = checkSupportAttack(
                        trainerData[0].moves[positionId].id,
                        attackerId
                    );
                    $("#battleText").html(trainerData[0].data.char_name + html);
                    reloadBattleData();
                    return true;
                }
            }
        } else {
            //when its the enemy turn, he just chooses a random attack
            var attack =
                rivalData[0].moves[
                    Math.floor(Math.random() * rivalData[0].moves.length)
                ];
            if (attack.power > 0) {
                //attack is the random attack
                var attackFormula =
                    rivalData[0].data.atk +
                    attack.power * (100 / (100 + trainerData[0].data.def));
                //check STAB and type
                if (rivalData[0].data.type === attack.type) {
                    attackFormula *= 1.25;
                }
                //type weakness chart
                attackFormula *= typeWeakness(
                    attack.type,
                    trainerData[0].data.type
                ); // returns type multiplier
                attackFormula = Math.floor(attackFormula / 2);
                //formula finished, now we hit
                var accuracy = attack.accuracy;
                //get random number, if its higher than accuracy, move fails, easy
                var hits = Math.floor(Math.random() * 100);
                if (hits > accuracy) {
                    $("#battleText")
                        .html("Attack failed!")
                        .fadeToggle(2000, function () {
                            $("#battleText").html("");
                        });
                    return true;
                } else {
                    //hit
                    rivalData[0].data.staminaPoints -= attack.cost;
                    //check if its THAT skill
                    if (attack.id == 9) {
                        trainerData[0].data.healthPoints = 0;
                        $("#battleText").html(
                            "The judgment has been casted. Sentence is death."
                        );
                    } else if (
                        trainerData[0].data.healthPoints - attackFormula <
                        0
                    ) {
                        trainerData[0].data.healthPoints = 0;
                    } else {
                        trainerData[0].data.healthPoints -= attackFormula;
                        $("#battleText")
                            .html(
                                rivalData[0].data.char_name +
                                    " uses " +
                                    attack.name
                            )
                            .fadeToggle(2000, function () {
                                $("#battleText").html("");
                            });
                    }
                    //check if youre dead
                    if (trainerData[0].data.healthPoints <= 0) {
                        if (trainerData[1] === undefined) {
                            //no one else left, you lose lmao TODO
                            var result = "lose";
                            finishBattle(trainerData, result);
                        } else {
                            //release next character
                            switchFaintedChar();
                            reloadBattleData();
                            return false;
                        }
                    } else {
                        reloadBattleData();
                        return true;
                    }
                }
            } else {
                var accuracy = attack.accuracy;
                //get random number, if its higher than accuracy, move fails, easy
                var hits = Math.floor(Math.random() * 100);
                if (hits > accuracy) {
                    $("#battleText").html("Attack failed!");
                    return true;
                } else {
                    let html = checkSupportAttack(attack.id, attackerId);
                    $("#battleText").html(rivalData[0].data.char_name + html);
                    reloadBattleData();
                    return true;
                }
            }
        }
    }

    function processBattleTurn(userAction, idAction) {
        //here is whats going to happen EVERY TURN
        //remove and re-add all elements so they get updated every turn with minimal weight (no 40000 ajax calls)
        //show the commands box
        //check whether a skill has been triggered
        $("#buttonBar").attr("hidden", "true");
        //check id event and action
        switch (userAction) {
            case "attack":
                //attack command, id is the attack that has been used
                //check speeds
                if (trainerData[0].data.speed > rivalData[0].data.speed) {
                    $("#battleText")
                        .html(
                            trainerData[0].data.char_name +
                                " uses " +
                                trainerData[0].moves[idAction[1]].name
                        )
                        .fadeToggle(2000, function () {
                            let canAttack = attackProcess("user", idAction[1]);
                            $("#battleText").fadeToggle(2000, function () {
                                //enemy turn
                                if (canAttack) {
                                    canAttack = attackProcess("rival", "");
                                    $("#battleText").fadeToggle(
                                        2000,
                                        function () {
                                            if (!canAttack) {
                                                //ur dead lol
                                                switchFaintedChar();
                                            } else {
                                                //turn over
                                                turnBasedSkills(
                                                    trainerData[0].data
                                                        .skill_id,
                                                    trainerData[0]
                                                );
                                                turnBasedSkills(
                                                    trainerData[0].data
                                                        .skill_id,
                                                    rivalData[0]
                                                );
                                                $("#buttonBar").removeAttr(
                                                    "hidden"
                                                );
                                            }
                                        }
                                    );
                                } else {
                                    //turn over
                                    turnBasedSkills(
                                        trainerData[0].data.skill_id,
                                        trainerData[0]
                                    );
                                    turnBasedSkills(
                                        trainerData[0].data.skill_id,
                                        rivalData[0]
                                    );
                                    $("#buttonBar").removeAttr("hidden");
                                }
                            });
                        });
                } else {
                    //they attack first
                    let canAttack = attackProcess("rival", "");
                    $("#battleText").fadeToggle(2000, function () {
                        //our turn
                        if (!canAttack) {
                            //ur dead lol
                            switchFaintedChar();
                        } else {
                            attackProcess("user", idAction);
                            $("#battleText").fadeToggle(2000, function () {
                                //turn over
                                $("#buttonBar").removeAttr("hidden");
                            });
                        }
                    });
                }

                break;

            case "item":
                //item has already been used, just show text with item name
                $("#battleText")
                    .html("Used " + idAction)
                    .fadeToggle(2000, function () {
                        //enemy turn
                        let canAttack = attackProcess("rival", "");
                        $("#battleText").fadeToggle(2000, function () {
                            //our turn
                            if (!canAttack) {
                                //ur dead lol
                                switchFaintedChar();
                            } else {
                                //turn over
                                $("#buttonBar").removeAttr("hidden");
                            }
                        });
                    });
                break;

            case "change":
                //no attack
                //they attack
                let canAttack = attackProcess("rival", "");
                $("#battleText").fadeToggle(2000, function () {
                    //our turn
                    if (!canAttack) {
                        //ur dead lol
                        switchFaintedChar();
                    } else {
                        //turn over
                        $("#buttonBar").removeAttr("hidden");
                    }
                });
        }
    }

    function toggleCall(user, eventId) {
        values = {
            user: user,
            eventId: eventId,
        };
        getdetails("/play/toggleCallable", values).done(function (response) {
            if (response.success !== undefined) {
            } else {
            }
        });
    }

    function turnBasedSkills(skillId, arrayData) {
        switch (skillId) {
            case 1:
                //Salvo, +2 SPE
                //turn-based
                arrayData.data.speed += 2;
                return arrayData.data.char_name + "'s speed raised by 2";
            case 2:
                //Seal of Fantasy, +1 ATK
                //turn-based
                arrayData.data.atk += 1;
                return arrayData.data.char_name + "'s attack raised by 1";

            case 6:
                //Calmed, recover 5% hp each turn
                //turn-based
                if (arrayData.data.healthPoints < arrayData.data.maxHealth) {
                    arrayData.data.healthPoints +=
                        (arrayData.data.healthPoints * 5) / 100;
                    return arrayData.data.char_name + " recovered health!";
                }

                break;
        }
    }

    function oneTimeSkills(skillId, arrayData) {
        //skills that are triggered only when the character joins
        switch (skillId) {
            case 5:
                //Judge of the Darkness, raise accuracy of hand of death for every over-level
                //one-time based
                //check whether this is the user or not to check the overlevel
                if (arrayData.data.owner === user) {
                    var overLevel =
                        trainerData[0].data.level - rivalData[0].data.level;
                    if (overLevel > 0) {
                        //check if character has the move
                        for (let i = 0; i < trainerData[0].moves.length; i++) {
                            if (trainerData[0].moves[i].id === 9) {
                                //hand of death
                                trainerData[0].moves[i].accuracy +=
                                    5 * overLevel;
                            }
                        }
                    }
                } else if (arrayData.data.owner !== user) {
                    var overLevel =
                        rivalData[0].data.level - trainerData[0].data.level;
                    if (overLevel > 0) {
                        //check if character has the move
                        for (let i = 0; i < rivalData[0].moves.length; i++) {
                            if (rival.moves[i].id === 9) {
                                //hand of death
                                rival.moves[i].accuracy += 5 * overLevel;
                            }
                        }
                    }
                }
                break;
        }
    }

    function actionBasedSkills(skillId, arrayData) {
        //skills that require an special event to happen
        switch (skillId) {
            case 3:
                //Necromancy, recover 50% hp when killed
                arrayData.data.healthPoints = arrayData.data.healthMax / 2;
                return " has risen from the dead once more.";
            case 4:
                //extracurricular class, get 50% more net exp gain TODO
                break;
            case 7:
                //Traveller of the Storms, get 1x modifier against Electric
                //action based
                if (arrayData.data.owner === user) {
                    if (rivalData[0].data.type === "Electric") {
                        modifierAtk = 1;
                    }
                } else if (arrayData.data.owner !== user) {
                }
                break;
        }
    }

    function reloadBattleData() {
        //this function allows us to do minimal tinkering whenever we change characters or anything, just having to change
        //the array values, then letting it reload itself
        $("#trainerSprite").empty();
        $("#rivalSprite").empty();
        $("#trainerBar").empty();
        $("#rivalBar").empty();

        var trainerImg =
            "/sprites/characters/" +
            trainerData[0].data.char_name +
            "/sprite.png";
        var rivalImg =
            "/sprites/characters/" +
            rivalData[0].data.char_name +
            "/sprite.png";
        $("#trainerSprite").attr("src", trainerImg).removeAttr("hidden");
        $("#rivalSprite").attr("src", rivalImg).removeAttr("hidden");
        var tName = trainerData[0].data.char_name;
        var tLevel = trainerData[0].data.level;
        var tHpBar = trainerData[0].data.healthPoints;
        var tStBar = trainerData[0].data.staminaPoints;
        $("#trainerBar").append(
            "<div id='tName'>" +
                tName +
                "</div>" +
                "<div id='tLevel'>Lv." +
                tLevel +
                "</div>" +
                "<div id='tHpBar'>HP: " +
                tHpBar +
                "</div>" +
                "<div id='tStBar'>ST: " +
                tStBar +
                "</div>"
        );

        var rName = rivalData[0].data.char_name;
        var rLevel = rivalData[0].data.level;
        var rHpBar = rivalData[0].data.healthPoints;
        var rStBar = rivalData[0].data.staminaPoints;
        $("#rivalBar").append(
            "<div id='rName'>" +
                rName +
                "</div>" +
                "<div id='rLevel'>Lv." +
                rLevel +
                "</div>" +
                "<div id='rHpBar'>HP: " +
                rHpBar +
                "</div>" +
                "<div id='rStBar'>ST: " +
                rStBar +
                "</div>"
        );
        //first turn, get stats
        trainerData[0].data.atk =
            (trainerData[0].data.atkMax / 100) * trainerData[0].data.level;
        trainerData[0].data.def =
            (trainerData[0].data.defMax / 100) * trainerData[0].data.level;
        trainerData[0].data.speed =
            (trainerData[0].data.speedMax / 100) * trainerData[0].data.level;

        rivalData[0].data.atk =
            (rivalData[0].data.atkMax / 100) * rivalData[0].data.level;
        rivalData[0].data.def =
            (rivalData[0].data.defMax / 100) * rivalData[0].data.level;
        rivalData[0].data.speed =
            (rivalData[0].data.speedMax / 100) * rivalData[0].data.level;
    }

    Array.prototype.swap = function (x, y) {
        var b = this[x];
        this[x] = this[y];
        this[y] = b;
        return this;
    };
});
