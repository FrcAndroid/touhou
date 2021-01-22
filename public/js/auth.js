'use strict';
$(document).ready(function() {
    let user = $("#userGlobal").attr('value');
    //TODO might be defining the ajax call too many times
    $.ajax({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        url: "/load/loadMessages",
        type: "post",
        dataType: 'json',
        data: {
            'user': user,
        },
    })
        .done(function (response) {
            if (response.success !== undefined) {
                if (response.success > 0) {
                    $("#msgCount").append(response.success);
                    $(".inboxIcon").attr('src', "/open-iconic/svg/envelope-open.svg");
                } else {
                    $("#msgCount").append(response.success);
                }
            } else {

            }
        });

    $('#inboxModal').on('show.bs.modal', function () {
        //first time we enter we retrieve a list to show all messages
        let user = $("#userGlobal").attr('value');

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: "/load/loadMessagesList",
            type: "post",
            dataType: 'json',
            data: {
                'user': user,
            },
        })
            .done(function (response) {
                if (response.success !== undefined) {
                    $(".cont").remove();
                    let messageList = response.success;
                    $.each(messageList, function (i) {
                        $("#listMessage").append("<div class='cont'>" +
                            "<div class='inboxId' hidden>" + messageList[i].id + "</div>" +
                            "<a class='inboxSubject float-left' id ="+ messageList[i].id+ " data-id ="+ messageList[i].id+ " href='' data-toggle='modal' data-target='#privateMessageModal'>" + messageList[i].subject + "</a>" +
                            "<div class='float-right'>"+ messageList[i].created_at +"</div>" +
                            "<br><a class='inboxFrom'>" + messageList[i].from + "</a>" +
                            "</div>");

                        $(".inboxFrom").attr("href", "/u/" + messageList[i].from);

                        if (messageList[i].status === "UNREAD") {
                            $(".inboxSubject#"+ messageList[i].id).attr('data-id', messageList[i].id).css({
                                "font-weight": "bold",
                                "font-size": "16px",
                                "color" : "blue"
                            })

                            $(".cont").css({
                                "border-left": "5px solid blue"
                            })
                        }
                        else{
                            $(".inboxSubject#"+ messageList[i].id).attr('data-id', messageList[i].id).css({
                                "color" : "black"
                            })
                        }


                    });
                    //add style and positioning
                    $(".cont").css({
                        "border": "1px solid",
                        "background-color" : "beige"
                    });

                    $(".inboxSubject").css({
                        "margin-left": "5px"

                    });

                    $(".inboxFrom").css({
                        "font-size": "80%",
                        "margin-left": "10px",
                        "color" : "gray"
                    });

                } else {
                    //TODO why is this empty
                }
            });
    });


    $('#privateMessageModal').on('show.bs.modal', function (e) {
        $('#inboxModal').modal('hide')

        var messageId = $(e.relatedTarget).data('id')
        //$(this).find('.modal-body input').val(bookId)
        $(".replyMessage").attr('id', messageId);
        //when entering here we search the message to show its values

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: "/load/loadIndividualMessage",
            type: "post",
            dataType: 'json',
            data: {
                'message' : messageId
            },
        })
            .done(function (response) {
                if (response.messageData !== undefined) {
                    let messageData = response.messageData
                    $("#messageFrom").append(response.fromText +  messageData.from);
                    $("#messageSubject").append(response.subjectText + messageData.subject);
                    $("#messageDate").append(messageData.created_at);
                    $("#messageContent").append(messageData.message);

                } else {
                    //TODO why is this empty
                }
            });
    });


    $('#privateMessageModal').on('hide.bs.modal', function () {

        $('#messageFrom').html('');
        $('#messageSubject').html('');
        $('#messageDate').html('');
        $('#messageContent').html('');

        $('#inboxModal').modal('show')
    });

    $('.replyMessage').on('click', function (e) {
        var messageId = $(this).attr('id')

        $('#messageFrom').html('');
        $('#messageSubject').html('');
        $('#messageDate').html('');
        $('#messageContent').html('');

        $('#privateMessageModal').modal('hide')

        $('#sendReplyModal').modal('show')

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: "/load/getReplyData",
            type: "post",
            dataType: 'json',
            data: {
                'message' : messageId
            },
        })
            .done(function (response) {
                if (response.messageData !== undefined) {
                    let messageData = response.messageData
                    $("#replyTo").append(response.toText +  messageData.from);
                    $("#replySubjectLabel").append(response.subjectText);
                    $("#replySubject").attr('value', "RE: " + messageData.subject);
                    $("#replyMessageLabel").append(response.messageText);
                    $("#replyMessage").append(messageData.message);

                    $("#replyTo").attr('sender', messageData.from);

                } else {

                }
            });
    });

    $(".sendMessage").on("click", function(event){
        let subject = $("#replySubject").val();
        let message = $("#replyMessage").val();
        let sender = user;
        let receiver = $("#replyTo").attr('sender');

        if(message !== ""){
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                url: "/edit/sendMessage",
                type: "post",
                dataType: 'json',
                data: {
                    'subject': subject,
                    'message': message,
                    'sender' : sender,
                    'receiver' : receiver
                },
            })
                .done(function (response) {
                    if(response.success !== undefined){
                        alert(response.success);
                        $('#sendMessageModal').modal('hide')
                    }
                    else{
                        alert(response.error);
                    }
                });

        }

    });
});
