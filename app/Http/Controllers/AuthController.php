<?php

namespace App\Http\Controllers;

use App\Message;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function loadMessages(){
        //cargamos los mensajes cada vez que se reinicia la pagina
        $json = [];
        if(isset($_POST)){
            $user = $_POST['user'];
            $messageList = Message::where(["to" => $user, "status" => "UNREAD"])->get();;

            $json['success'] = count($messageList);
            echo json_encode($json);

        }
    }

    public function loadMessageList(){
        //cargamos la lista de mensajes al abrir el modal
        $json = [];
        if(isset($_POST)){
            $user = $_POST['user'];
            $messageList = Message::where(["to" => $user])->get();

            $json['success'] = $messageList;
            echo json_encode($json);

        }
    }

    public function loadMessage(){
        //cargamos un mensaje individual y cambiamos el estado de este mensaje
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
        //cargamos datos del mensaje que vamos a responder
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
