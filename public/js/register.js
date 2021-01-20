'use strict'

$(document).ready(function(){
   //enters when page is loaded
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
   $(".fieldForm").focusout(function () {
       let field = this.id;//we will use this later for validation messages
       let value = this.value;//value of the field we want to check
       let values = {
           "field" : field,
           "value" : value
       }

       getdetails(values, "validateField")
           .done(function(response){
               if(response.success != undefined){
                   if(field !== "password-confirm" && field !== "password"){
                       let div = "<span class='valid-feedback   "+ field + "Valid'><strong>"+response.success+"</strong></span>";
                       $("."+field+"Valid").remove();//remove message
                       $("#"+field).removeClass("is-invalid").addClass("is-valid")//change classes
                       $(div).insertAfter("#"+field)
                   }
                   else{
                       //check password and repeated password
                       let pass = $("#password").val();
                       let passConfirm = $("#password-confirm").val();
                       /*if(!empty(passConf)){
                           if(campo === "password"){
                               //ya existe una pass para comparar y acabamos de cambiar la password principal
                               if(pass === value){
                                   //contraseñas coinciden

                               }
                           }
                       }*/
                        if(pass !== value){
                            //TODO untranslated strings
                            let div = "<span class='invalid-feedback passwordValid'><strong>Passwords don't match.</strong></span>";
                            let div2 = "<span class='invalid-feedback password-confirmValid'><strong>Passwords don't match.</strong></span>";
                            $(".passwordValid").remove();//remove message
                            $(".password-confirmValid").remove();

                            $("#password").removeClass("is-valid").addClass("is-invalid")//change class
                            $("#password-confirm").removeClass("is-valid").addClass("is-invalid")

                            $(div).insertAfter("#password")
                            $(div2).insertAfter("#password-confirm")

                        }
                        else{
                            let div = "<span class='valid-feedback passwordValid'><strong>Valid password.</strong></span>";
                            $(".passwordValid").remove();//remove message
                            $(".password-confirmValid").remove();

                            $("#password").removeClass("is-invalid").addClass("is-valid")//change class
                            $("#password-confirm").removeClass("is-invalid").addClass("is-valid")

                            $(div).insertAfter("#password")
                        }
                   }

               }
               else{
                   //error
                   let div = "<span class='invalid-feedback "+ field + "Valid'><strong>"+response.error+"</strong></span>";
                   $("."+field+"Valid").remove();
                   $("#"+field).removeClass("is-valid").addClass("is-invalid")
                   $(div).insertAfter("#"+field)
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
