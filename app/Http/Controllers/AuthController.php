<?php

namespace App\Http\Controllers;

use App\Message;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function loadMessages(){
        //load message list everytime page is loaded, this is so we can show the unread message counter on profile
        $json = [];
        if(isset($_POST)){
            $user = $_POST['user'];
            $messageList = Message::where(["to" => $user, "status" => "UNREAD"])->get();;

            $json['success'] = count($messageList);
            echo json_encode($json);

        }
    }

    public function loadMessageList(){
        //load message list when opening inbox
        $json = [];
        if(isset($_POST)){
            $user = $_POST['user'];
            $messageList = Message::where(["to" => $user])->get();

            $json['success'] = $messageList;
            echo json_encode($json);

        }
    }

    public function loadMessage(){
        //load specific message and update its status to READ
        $json = [];
        if(isset($_POST)){
            $messageId = $_POST['message'];

            $message = Message::where('id', $messageId)->first();
            $message->status = "READ";
            $message->save();
            $json['messageData'] = $message;
            $json['fromText'] = trans("From: ");
            $json['subjectText'] = trans("Subject: ");

            echo json_encode($json);
        }
    }

    public function getReplyData(){
        //load data from message we're about to send
        $json = [];
        if(isset($_POST)){
            $messageId = $_POST['message'];

            $message = Message::where('id', $messageId)->first();
            $json['messageData'] = $message;
            $json['toText'] = trans("To: ");
            $json['subjectText'] = trans("Subject: ");
            $json['messageText'] = trans("Message: ");


            echo json_encode($json);
        }
    }
}
