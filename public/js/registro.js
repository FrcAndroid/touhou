'use strict'

$(document).ready(function(){
   //entra cuando carga la pagina
    let getdetails = function (values, link) {
        return $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: link,
            method: "POST",
            data: values,
            dataType: "json"
        });

    };
   $(".campoform").focusout(function () {
       let campo = this.id;//lo usaremos mas tarde para pegar los mensajes de validación
       let value = this.value;//valor del campo que queremos comprobar
       let values = {
           "campo" : campo,
           "value" : value
       }

       getdetails(values, "validarCampo")
           .done(function(response){
               if(response.success != undefined){
                   //exito
                   if(campo !== "password-confirm" && campo !== "password"){
                       let div = "<span class='valid-feedback   "+ campo + "Validez'><strong>"+response.success+"</strong></span>";
                       $("."+campo+"Validez").remove();//quitamos mensaje
                       $("#"+campo).removeClass("is-invalid").addClass("is-valid")//cambiamos clases
                       $(div).insertAfter("#"+campo)
                   }
                   else{
                       //comprobacion de contraseña y repeticion de contraseña
                       let pass = $("#password").val();
                       let passConf = $("#password-confirm").val();
                       /*if(!empty(passConf)){
                           if(campo === "password"){
                               //ya existe una pass para comparar y acabamos de cambiar la password principal
                               if(pass === value){
                                   //contraseñas coinciden

                               }
                           }
                       }*/
                        if(pass !== value){
                            let div = "<span class='invalid-feedback passwordValidez'><strong>Las contraseñas no coinciden.</strong></span>";
                            let div2 = "<span class='invalid-feedback password-confirmValidez'><strong>Las contraseñas no coinciden.</strong></span>";
                            $(".passwordValidez").remove();//quitamos mensaje
                            $(".password-confirmValidez").remove();//quitamos mensaje

                            $("#password").removeClass("is-valid").addClass("is-invalid")//cambiamos clases
                            $("#password-confirm").removeClass("is-valid").addClass("is-invalid")//cambiamos clases

                            $(div).insertAfter("#password")
                            $(div2).insertAfter("#password-confirm")

                        }
                        else{
                            let div = "<span class='valid-feedback passwordValidez'><strong>Valid password.</strong></span>";
                            $(".passwordValidez").remove();//quitamos mensaje
                            $(".password-confirmValidez").remove();//quitamos mensaje

                            $("#password").removeClass("is-invalid").addClass("is-valid")//cambiamos clases
                            $("#password-confirm").removeClass("is-invalid").addClass("is-valid")//cambiamos clases

                            $(div).insertAfter("#password")
                        }
                   }

               }
               else{
                   //error
                   let div = "<span class='invalid-feedback "+ campo + "Validez'><strong>"+response.error+"</strong></span>";
                   $("."+campo+"Validez").remove();
                   $("#"+campo).removeClass("is-valid").addClass("is-invalid")
                   $(div).insertAfter("#"+campo)
               }
                console.log(response);
           })
           .fail(function(jqXHR, textStatus, errorThrown) {
           $("#textFail").remove();
           $("<div/>",{
               "id": "textFail",
               "class" : "text-danger",
               // .. you can go on and add properties
               "html" : "Something went wrong: " + textStatus,
           }).appendTo("body");

       });


   });

    $(".nav-link").click(function(e) {
        e.stopPropagation();
    });
});
