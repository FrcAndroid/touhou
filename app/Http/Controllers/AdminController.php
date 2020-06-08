<?php

namespace App\Http\Controllers;

use App\Ban;
use App\Report;
use App\Warning;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getReports(){
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];
            $bans = Report::where(['status' => 'Pending'], ['reported' => $user])->get();
            //coleccion de reports
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
