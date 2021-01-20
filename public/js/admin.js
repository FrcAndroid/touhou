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
        let user = $(this).attr('user');
        let modalType = $(this).attr('data-target');

        if(modalType === "#bansModal"){
            $("#bansModal").on('show.bs.modal', bansModalShow(user));
        }

        else if(modalType === "#reportsModal"){
            $("#reportsModal").on('show.bs.modal', reportModalShow(user));
        }

        else if(modalType === "#historyModal"){
            $("#reportsModal").on('show.bs.modal', historyModalShow(user));
        }


    });

    var reportId = 0;

    $(document).on('click', '.inboxSubject', function(){
        //receive report id for ajax call
        reportId = $(this).attr('data-id');

        $("#reportHandlerModal").modal('show');
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


    function reportModalShow(user){
        let userTab = "<div class='float-left ml-1 userReportName'>"+ user + "</div>";
        //ajax call to receive all pending reports
        let values = {
            "user" : user
        }
        getdetails("/admin/getReports", values)
            .done(function(response){
                if(response.success !== "undefined"){

                    $(userTab).detach();
                    $(".cont").css('');
                    $(".cont").empty();

                    $(userTab).insertAfter("#reportHeaderMsg");
                    let reportList = response.success;
                    $.each(reportList, function (i) {
                        let reportDate = new Date(reportList[i].created_at);
                        let subject = reportList[i].reason.substring(0,15)
                        if(reportList[i].reason.length > 15){
                            subject += "...";
                        }
                        $("#reportList").append("<div class='cont' style='border: 1px solid'>" +
                            "<div class='reportId' hidden>" + reportList[i].id + "</div>" +
                            "<a class='inboxSubject float-left' id =" + reportList[i].id + " data-id =" + reportList[i].id + " href='' data-toggle='modal' data-target='#reportHandlerModal'>" + subject + "</a>" +
                            "<div class='float-right'>" + reportDate.toLocaleDateString() +"     "+ reportDate.toLocaleTimeString() + "</div>" +
                            "<br><a class='inboxFrom'>" + reportList[i].reported + "</a>" +
                            "</div><br>");


                    });
                }

            })

    }

    function bansModalShow(user){
        let userTab = "<div class='float-left ml-1 userBanName'>"+ user + "</div>";
        //ajax call to receive all bans
        let values = {
            "user" : user
        }
        getdetails("/admin/getBans", values)
            .done(function(response){
                if(response.success !== "undefined"){

                    $(userTab).detach();
                    $(".cont").css('');
                    $(".cont").empty();
                    $(userTab).insertAfter("#banHeaderMsg");
                    let banList = response.success;
                    $.each(banList, function (i) {
                        let banDate = new Date(banList[i].created_at);

                        if(banList[i].status === "Active"){
                            $("#banContent").append("<div class='cont' style='border: 1px solid'>" +
                                "<div class='reportId' hidden>" + banList[i].id + "</div>" +
                                "<div class='float-right'>" + banDate.toLocaleDateString() +"     "+ banDate.toLocaleTimeString() + "</div>" +
                                "<a class='banBy'>" + banList[i].bannedBy + "</a><BR> " +
                                "<a class='banReason'>" + banList[i].reason + "</a>" +
                                "</div><br>");



                            $("#banProcess").attr('banId', banList[i].id);
                        }

                    });
                }

            })

    }

    function historyModalShow(user){
        let userTab = "<div class='float-left ml-1 userHistoryName'>"+ user + "</div>";
        //ajax call to receive the historical for an user
        let values = {
            "user" : user
        }
        getdetails("/admin/getHistory", values)
            .done(function(response){
                if(response !== "undefined"){

                    $(userTab).detach();

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
                        let banDate = new Date(banList[i].created_at);
                        $(".banHistory").append("<div class='cont' style='border: 1px solid'>" +
                            "<div class='reportId' hidden>" + banList[i].id + "</div>" +
                            "<div class='float-right'>" + banDate.toLocaleDateString() +"     "+ banDate.toLocaleTimeString() + "</div>" +
                            "<a class='banStatus'>" + banList[i].status + "</a><BR> " +
                            "<a class='banBy'>" + banList[i].bannedBy + "</a><BR> " +
                            "<a class='banReason'>" + banList[i].reason + "</a>" +
                            "</div><br>");
                        $(".banStatus").addClass(banList[i].status);


                    });

                    $.each(warningList, function (i) {
                        let warningDate = new Date(warningList[i].created_at);

                        $(".warningHistory").append("<div class='cont' style='border: 1px solid'>" +
                            "<div class='warningId' hidden>" + warningList[i].id + "</div>" +
                            "<div class='float-right'>" + warningDate.toLocaleDateString() +"     "+ warningDate.toLocaleTimeString() + "</div>" +
                            "<a class='warnedBy'>" + warningList[i].warnedBy + "</a><BR> " +
                            "<a class='warnReason'>" + warningList[i].reason + "</a>" +
                            "</div><br>");
                    });

                    $("#banAdd").attr('userId', user);
                    $("#warningAdd").attr('userId', user);

                }

            })

    }
});
