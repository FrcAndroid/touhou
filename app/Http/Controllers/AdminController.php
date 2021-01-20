<?php

namespace App\Http\Controllers;

use App\Ban;
use App\Report;
use App\Warning;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getReports(){
        //receive pending reports from database
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];
            $bans = Report::where(['status' => 'Pending'], ['reported' => $user])->get();
            if($bans->first() != null){
                $json['success'] = $bans;
            }
            else{
                $json['error'] = trans("Error when retrieving the reports");
            }

            echo json_encode($json);
        }
    }

    public function getIndividualReport(){
        //get an individual report for processing
        $json = [];
        if(isset($_POST)){
            $banId = $_POST['reportId'];
            $ban = Report::where('id', $banId)->get();

            if($ban->first() != null){
                $json['success'] = $ban;
            }
            else{
                $json['error'] = trans("Error when retrieving the reports");
            }

            echo json_encode($json);
        }
    }

    public function processReport(){
        //update the report with the new data added by the mod
        if(isset($_POST)){
            $json = [];

            $banId = $_POST['reportId'];
            $banAction = $_POST['reportAction'];
            $processedBy = $_POST['processedBy'];

            $ban = Report::where('id', $banId)->first();
            $ban->actionTaken = $banAction;
            $ban->status = "Resolved";
            $ban->processedBy = $processedBy;
            $ban->save();
            if($ban->wasChanged()){
                $json['success'] = trans('Report processed successfully');
            }
            else{
                $json['error'] = trans("Error when processing the report");
            }

            echo json_encode($json);
        }
    }

    public function getBans(){
        //receive list of all active bans from database
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];

            $ban = Ban::where(['user' => $user], ['status' => 'Active'])->get();

            if($ban->first() != null){
                $json['success'] = $ban;
            }
            else{
                $json['error'] = trans("Error when retrieving the reports");
            }

            echo json_encode($json);
        }
    }

    public function processBan(){
        //update ban status on database
        if(isset($_POST)){
            $json = [];

            $banId = $_POST['banId'];
            $banAction = $_POST['banAction'];
            $processedBy = $_POST['processedBy'];

            $ban = Ban::where('id', $banId)->first();
            $ban->unban_reason = $banAction;
            $ban->status = "Resolved";
            $ban->unbanned_by = $processedBy;
            $ban->save();
            if($ban->wasChanged()){
                $json['success'] = trans('Ban processed successfully');
            }
            else{
                $json['error'] = trans("Error when processing the ban");
            }

            echo json_encode($json);
        }
    }

    public function getHistory(){
        //get historical record of reports and bans from user
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];

            $warningList = Warning::where(['user' => $user], ['status' => 'Active'])->get();
            $banList = Ban::where(['user' => $user])->get();

            $json['bans'] = $banList;
            $json['warnings'] = $warningList;

            echo json_encode($json);
        }
    }

    public function addWarning(){
        //add a warning on an user, create record
        if(isset($_POST)) {
            $json = [];

            $user = $_POST['userId'];
            $warningAction = $_POST['warningAction'];
            $processedBy = $_POST['processedBy'];

            $warning = new Warning;
            $warning->user = $user;
            $warning->warnedBy = $processedBy;
            $warning->reason = $warningAction;
            $warning->status = "Active";

            if ($warning->save()) {
                $json['success'] = trans("Warning added successfully");
            } else {
                $json['error'] = trans("Error when adding warning");
            }

            echo json_encode($json);
        }
    }

    public function addBan(){
        //add ban on user, create record
        if(isset($_POST)){
            $json = [];

            $user = $_POST['userId'];
            $banAction = $_POST['banAction'];
            $processedBy = $_POST['processedBy'];
            //get bans first
            $currentBans = Ban::where('user', $user);

            if($currentBans->first() != null){
                $json['error'] = trans("There is already a ban in place.");
            }
            else{
                $ban = new Ban;
                $ban->user = $user;
                $ban->bannedBy = $processedBy;
                $ban->reason = $banAction;
                $ban->status = "Active";

                if ($ban->save()) {
                    $json['success'] = trans("Ban added successfully");
                } else {
                    $json['error'] = trans("Error when adding ban");
                }
            }

            echo json_encode($json);
        }
    }

}
