<?php

namespace App\Http\Controllers;

use App\Message;
use App\Report;
use App\User;
use finfo;
use Illuminate\Http\Request;
use RuntimeException;

class UserController extends Controller
{
    public function upload(){

        $json = [];
        //upload file to server
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['file']['tmp_name'];
            $fileName = $_FILES['file']['name'];
            $fileSize = $_FILES['file']['size'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));

            //clean the username
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;

            if($fileSize < 1000000){
                $allowedfileExtensions = array('jpg', 'gif', 'png', 'zip', 'txt', 'xls', 'doc');
                if (in_array($fileExtension, $allowedfileExtensions)) {
                    // directory in which the uploaded file will be moved
                    $uploadFileDir = 'pfp/';
                    $dest_path = $uploadFileDir . $newFileName;
                    if(move_uploaded_file($fileTmpPath, $dest_path))
                    {
                        $json['success'] = trans('Image updated successfully.');

                        //update database
                        $user = User::where("nick", $_POST['user'])->first();
                        $user->profilePicture = $newFileName;
                        $user->save();
                        if($user->wasChanged()){
                            $json['success'] = trans('Image updated successfully.');
                        }
                        else{
                            $json['error'] = trans("Error when updating image.");
                        }
                    }
                    else
                    {
                        $json['error'] = trans("Error when uploading image.");
                    }
                }
                else{
                    $json['error'] = trans("Invalid file format.");
                }
            }
            else{
                $json['error'] = trans("Exceeded filesize limit.");
            }

        }
        else{
            $json['error'] = trans("Invalid parameters.");
        }
        header('Content-Type: json; charset=utf-8');
        echo json_encode($json);
    }

    public function edit(){
        //updating user profile
        $json = [];

        if(isset($_POST)){
            $message = $_POST['message'];
            $field = $_POST['field'];
            $user = $_POST['user'];


            $userData = User::where('nick', $user)->first();
            $userData[$field] = $message;
            $userData->save();

            if($userData->wasChanged()){
                $json['success'] = trans("Updated successfully");
            }
            else{
                $json['error'] = trans("Error when updating profile");
            }

            echo json_encode($json);
        }
    }

    public function send(){
        //send a private message to an user
        $json = [];
        if(isset($_POST)){
            $subject = $_POST['subject'];
            $message = $_POST['message'];
            $sender = $_POST['sender'];
            $receiver = $_POST['receiver'];
            if($subject == ""){
                $subject = trans("Empty subject");
            }
                $msg = new Message;
                $msg->from = $sender;
                $msg->to = $receiver;
                $msg->subject = $subject;
                $msg->message = $message;
                $msg->created_at = date("Y-m-d H:i");
                $msg->save();

                if($msg->exists()){
                    $json['success'] = trans("Message sent successfully");
                }
                else{
                    $json['error'] = trans("Error when sending the message");
                }

                echo json_encode($json);
        }
    }

    public function report(){
        //report a user
        if(isset($_POST)){
            $json = [];
            $reporter = $_POST['reporter'];
            $reported = $_POST['reported'];
            $reportmsg = $_POST['message'];

            $report = new Report;
            $report->reporter = $reporter;
            $report->reported = $reported;
            $report->reason = $reportmsg;
            $report->status = "Pending";
            $report->save();
            if($report->exists){
                $json['success'] = trans("User reported successfully");
            }
            else{
                $json['error'] = trans("Error when reporting the user");
            }

            echo json_encode($json);

        }

    }
}
