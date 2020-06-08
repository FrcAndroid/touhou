'use strict';
$(document).ready(function() {
    let user = $("#userGlobal").attr('value');

    $.ajax({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        url: "/load/cargarMensajes",
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
        //la primera vez que entramos sacamos una lista para mostrar todos los mensajes
        let user = $("#userGlobal").attr('value');

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: "/load/cargarListaMensajes",
            type: "post",
            dataType: 'json',
            data: {
                'user': user,
            },
        })
            .done(function (response) {
                if (response.success !== undefined) {
                    console.log(response.success)
                    $(".cont").remove();
                    let lista = response.success;
                    $.each(lista, function (i) {
                        console.log(lista);
                        $("#listMessage").append("<div class='cont'>" +
                            "<div class='inboxId' hidden>" + lista[i].id + "</div>" +
                            "<a class='inboxSubject float-left' id ="+ lista[i].id+ " data-id ="+ lista[i].id+ " href='' data-toggle='modal' data-target='#privateMessageModal'>" + lista[i].subject + "</a>" +
                            "<div class='float-right'>"+ lista[i].created_at +"</div>" +
                            "<br><a class='inboxFrom'>" + lista[i].from + "</a>" +
                            "</div>");

                        $(".inboxFrom").attr("href", "/u/" + lista[i].from);

                        if (lista[i].status === "UNREAD") {
                            $(".inboxSubject#"+ lista[i].id).attr('data-id', lista[i].id).css({
                                "font-weight": "bold",
                                "font-size": "16px",
                                "color" : "blue"
                            })

                            $(".cont").css({
                                "border-left": "5px solid blue"
                            })
                        }
                        else{
                            $(".inboxSubject#"+ lista[i].id).attr('data-id', lista[i].id).css({
                                "color" : "black"
                            })
                        }


                    });
                    //añadimos estilos y posicionamiento
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

                }
            });
    });


    $('#privateMessageModal').on('show.bs.modal', function (e) {
        $('#inboxModal').modal('hide')

        var messageId = $(e.relatedTarget).data('id')
        //$(this).find('.modal-body input').val(bookId)
        $(".replyMessage").attr('id', messageId);
        console.log(messageId)
        //al entrar aqui buscamos el mensaje para mostrar sus valores

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: "/load/cargarMensajeIndividual",
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

                }
            });
    });


    $('#privateMessageModal').on('hide.bs.modal', function () {

        console.log('fire')
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
        console.log(receiver)

        if(message !== ""){
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                url: "/edit/enviarMensaje",
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
