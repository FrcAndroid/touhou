'use strict'
$(document).ready(function(){

    let admin = $("#userGlobal").attr('value');

    function getdetails(link, values){
        return $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: link,
            type: "post",
            dataType: 'json',
            data: values,

        });
    }

    $(".icon").on('click', function(){
        let usuario = $(this).attr('user');
        let modalType = $(this).attr('data-target');

        if(modalType === "#bansModal"){
            $("#bansModal").on('show.bs.modal', bansModalShow(usuario));
        }

        else if(modalType === "#reportsModal"){
            $("#reportsModal").on('show.bs.modal', reportModalShow(usuario));
        }

        else if(modalType === "#historyModal"){
            $("#reportsModal").on('show.bs.modal', historyModalShow(usuario));
        }


    });

    var reportId = 0;

    $(document).on('click', '.inboxSubject', function(){
        console.log('primero')
        //receive report id for ajax call
        reportId = $(this).attr('data-id');

        $("#reportHandlerModal").modal('show');
        console.log('segundo')
        //close previous modal and empty data
        $("#reportList").html('');
        $("#reportsModal").modal('hide');
        //ajax call to get full report data
        let values = {
            reportId : reportId
        }

        getdetails("/admin/getIndividualReport", values)
            .done(function(response){
                if(response.success !== undefined){
                    let report = response.success[0];

                    $("#reportContent").append(report.reason);
                }
                else{
                    console.log(response.error)
                }

            })
    });

    $("#reportProcess").on('click', function(){
        if($("#reportHandlingText").val() !== ""){
            //process report and add reason of report
            let values = {
                reportId: reportId,
                reportAction: $("#reportHandlingText").val(),
                processedBy: admin
            }
            getdetails('/admin/processReport', values)
                .done(function(response){
                    if(response.success !== "undefined"){
                        alert(response.success);
                        window.location.reload();
                    }
                    else{
                        alert(response.error)
                    }
                })
        }
    });

    $("#banProcess").on('click', function(){
        if($("#banHandlingText").val() !== ""){
            //process ban and add reason of unban
            let banId = $(this).attr('banId');
            let banAction = $("#banHandlingText").val();

            let values = {
                banId: banId,
                banAction: banAction,
                processedBy: admin
            }
            getdetails('/admin/processBan', values)
                .done(function(response){
                    if(response.success !== "undefined"){
                        alert(response.success);
                        window.location.reload();
                    }
                    else{
                        alert(response.error)
                    }
                })
        }
    });


    $("#warningAdd").on('click', function(){
        if($("#warningAddText").val() !== ""){
            //add warning
            let user = $(this).attr('userId');
            let warningAction = $("#warningAddText").val();

            let values = {
                userId : user,
                warningAction: warningAction,
                processedBy: admin
            }
            getdetails('/admin/addWarning', values)
                .done(function(response){
                    if(response.success !== "undefined"){
                        alert(response.success);
                        window.location.reload();
                    }
                    else{
                        alert(response.error)
                    }
                })
        }
    });

    $("#banAdd").on('click', function(){
        if($("#banAddText").val() !== ""){
            //process ban and add reason of unban
            let user = $(this).attr('userId');
            let banAction = $("#banAddText").val();
            console.log(user)

            let values = {
                userId : user,
                banAction: banAction,
                processedBy: admin
            }
            getdetails('/admin/addBan', values)
                .done(function(response){
                    if(response.success !== undefined){
                        alert(response.success);
                        window.location.reload();
                    }
                    else{
                        alert(response.error)
                    }
                })
        }
    });

    $("#reportHandlerModal").on('hide.bs.modal', function(){
        $("#reportHandlingText").val("");
        $("#reportContent").html("");
    });


    function reportModalShow(usuario){
        let userTab = "<div class='float-left ml-1 userReportName'>"+ usuario + "</div>";
        //ajax call para recibir todos los reportes pendientes
        let values = {
            "user" : usuario
        }
        getdetails("/admin/getReports", values)
            .done(function(response){
                if(response.success !== "undefined"){

                    $(userTab).detach();
                    $(".cont").css('');
                    $(".cont").empty();

                    $(userTab).insertAfter("#reportHeaderMsg");
                    let lista = response.success;
                    $.each(lista, function (i) {
                        let fecha = new Date(lista[i].created_at);
                        let subject = lista[i].reason.substring(0,15)
                        if(lista[i].reason.length > 15){
                            subject += "...";
                        }
                        $("#reportList").append("<div class='cont' style='border: 1px solid'>" +
                            "<div class='reportId' hidden>" + lista[i].id + "</div>" +
                            "<a class='inboxSubject float-left' id =" + lista[i].id + " data-id =" + lista[i].id + " href='' data-toggle='modal' data-target='#reportHandlerModal'>" + subject + "</a>" +
                            "<div class='float-right'>" + fecha.toLocaleDateString() +"     "+ fecha.toLocaleTimeString() + "</div>" +
                            "<br><a class='inboxFrom'>" + lista[i].reported + "</a>" +
                            "</div><br>");


                    });
                }

            })

    }

    function bansModalShow(usuario){
        let userTab = "<div class='float-left ml-1 userBanName'>"+ usuario + "</div>";
        //ajax call para recibir todos los reportes pendientes
        let values = {
            "user" : usuario
        }
        getdetails("/admin/getBans", values)
            .done(function(response){
                if(response.success !== "undefined"){

                    $(userTab).detach();
                    $(".cont").css('');
                    $(".cont").empty();
                    $(userTab).insertAfter("#banHeaderMsg");
                    let lista = response.success;
                    $.each(lista, function (i) {
                        let fecha = new Date(lista[i].created_at);

                        if(lista[i].status === "Active"){
                            $("#banContent").append("<div class='cont' style='border: 1px solid'>" +
                                "<div class='reportId' hidden>" + lista[i].id + "</div>" +
                                "<div class='float-right'>" + fecha.toLocaleDateString() +"     "+ fecha.toLocaleTimeString() + "</div>" +
                                "<a class='banBy'>" + lista[i].bannedBy + "</a><BR> " +
                                "<a class='banReason'>" + lista[i].reason + "</a>" +
                                "</div><br>");



                            $("#banProcess").attr('banId', lista[i].id);
                        }

                    });
                }

            })

    }

    function historyModalShow(usuario){
        let userTab = "<div class='float-left ml-1 userHistoryName'>"+ usuario + "</div>";
        //ajax call para recibir todos los reportes pendientes
        let values = {
            "user" : usuario
        }
        getdetails("/admin/getHistory", values)
            .done(function(response){
                if(response !== "undefined"){

                    $(userTab).detach();
                    /*$(".warningHistory").css('');
                    $(".warningHistory").empty();

                    $(".banHistory").css('');
                    $(".banHistory").empty();*/

                    $(userTab).insertAfter("#historyHeaderMsg");
                    let banList = response.bans;
                    let warningList = response.warnings;

                    if(warningList.length === 0){
                        $(".warningHistory").append("<div class='cont mb-4'><i>No warnings found</i></div>");
                    }

                    if(banList.length === 0){
                        $(".banHistory").append("<div class='cont mb-4'><i>No bans found</i></div>");
                    }
                    $.each(banList, function (i) {
                        let fecha = new Date(banList[i].created_at);
                        $(".banHistory").append("<div class='cont' style='border: 1px solid'>" +
                            "<div class='reportId' hidden>" + banList[i].id + "</div>" +
                            "<div class='float-right'>" + fecha.toLocaleDateString() +"     "+ fecha.toLocaleTimeString() + "</div>" +
                            "<a class='banStatus'>" + banList[i].status + "</a><BR> " +
                            "<a class='banBy'>" + banList[i].bannedBy + "</a><BR> " +
                            "<a class='banReason'>" + banList[i].reason + "</a>" +
                            "</div><br>");
                        $(".banStatus").addClass(banList[i].status);


                    });

                    $.each(warningList, function (i) {
                        let fecha = new Date(warningList[i].created_at);

                        $(".warningHistory").append("<div class='cont' style='border: 1px solid'>" +
                            "<div class='warningId' hidden>" + warningList[i].id + "</div>" +
                            "<div class='float-right'>" + fecha.toLocaleDateString() +"     "+ fecha.toLocaleTimeString() + "</div>" +
                            "<a class='warnedBy'>" + warningList[i].warnedBy + "</a><BR> " +
                            "<a class='warnReason'>" + warningList[i].reason + "</a>" +
                            "</div><br>");
                    });

                    $("#banAdd").attr('userId', usuario);
                    $("#warningAdd").attr('userId', usuario);

                }

            })

    }
});
