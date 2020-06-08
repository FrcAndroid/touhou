'use strict'
$(document).ready(function() {
    let user = $("#usuario").attr('value');
    let userProfile = $("#userProfile").attr("value");

    $("#formuploadajax").on("submit", function (e) {
        e.preventDefault();
        console.log(user);
        var formData = new FormData();
        formData.append('file', $('input[type=file]')[0].files[0]);
        formData.append('user', user);
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: "/edit/subirArchivoUser",
            type: "post",
            dataType: 'json',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        })
            .done(function (response) {
                if(response.success !== undefined){
                    alert(response.success);
                    window.location.reload();
                }
                else{
                    alert(response.error);
                    window.location.reload();
                }
            });
    });

    $(".editable").on("focusout", function(e){
        let message = this.innerText;
        let field = this.id;

        if(message !== ""){
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                url: "/edit/editarUser",
                type: "post",
                dataType: 'json',
                data: {'message': message, 'field' : field, 'user' : user},
            })
                .done(function (response) {
                    if(response.success !== undefined){
                        alert(response.success);
                        window.location.reload();
                    }
                    else{
                        alert(response.error);
                        window.location.reload();
                    }
                });

        }


    });

    $(".sendMessage").on("click", function(event){
        let subject = $("#subjectMessage").val();
        let message = $("#privateMessage").val();
        let sender = user;
        let receiver = userProfile;

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
                        window.location.reload();
                    }
                    else{
                        alert(response.error);
                        window.location.reload();
                    }
                });

        }

    });

    $(".reportButton").on('click', function(e){
        let message = $('#reportText').val();
        console.log(message);
        if(message !== ""){
            //llamada ajax para meter el reporte en la lista
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                url: "/edit/enviarReporte",
                type: "post",
                dataType: 'json',
                data: {
                    'reported': userProfile,
                    'message': message,
                    'reporter' : user,
                },
            })
                .done(function (response) {
                    if(response.success !== undefined){
                        alert(response.success);
                        $('#reportText').val('');
                        window.location.reload()
                    }
                    else{
                        alert(response.error);
                    }
                });

        }
    })
});
