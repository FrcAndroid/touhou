<?php

namespace App\Http\Controllers;

use App\Character;
use App\CharacterList;
use App\Event;
use App\Item;
use App\Map;
use App\MapPosition;
use App\MovesCharacter;
use App\MovesUser;
use App\Textline;
use App\User;
use App\UserConversation;
use App\UserEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function getData(){
        //retrieve player data when he starts game for further usage
        if(isset($_POST)){
            $json=[];
            $user = $_POST['user'];
            $userData = User::where('nick', $user)->first();

            if($userData->first() != null){
                $json['success'] = $userData;
            }
            else{
                $json['error'] = trans("Error when retrieving player data.");
            }

            echo json_encode($json);
        }
    }

    public function getConversation(){
        //get conversation from database to process in-game
        if(isset($_POST)) {
            $json = [];
            $conversationId = $_POST['conversationId'];
            $user = $_POST['user'];
            $conversation = Textline::where('conversation', $conversationId)->get();

            if($conversation->first() != null){
                //create new user-based conversation
                //but first, select conversation to see if its created yet
                $userHasConversation = UserConversation::where(['conversationId' => $conversationId, 'user' => $user])->get();
                if($userHasConversation->first() != null){
                    //select conversation
                    $conversation =
                        DB::table('textlines')
                            ->join('user_conversations', function($join){
                                $join->on('textlines.conversation', '=', 'user_conversations.conversationId');
                                $join->on('textlines.lineId', '=', 'user_conversations.lineId');
                            })
                            ->where(['textlines.conversation' => $conversationId,'user_conversations.callable' => 'true', 'user_conversations.user' => $user])
                            ->get();

                    if($conversation->first() != null){
                        $json['success'] = $conversation;
                    }
                }
                else{
                    foreach($conversation as $line){
                        $newLine = new UserConversation;
                        $newLine->lineId = $line['lineId'];
                        $newLine->user = $user;
                        $newLine->conversationId = $conversationId;
                        $newLine->save();
                    }
                    $conversation = UserConversation::where(['conversationId' => $conversationId, 'user' => $user, 'callable' => 'true'])->get();
                    if($conversation->first() != null){
                        //select conversation
                        $conversation = DB::table('textlines')
                            ->join('user_conversations', function($join){
                                $join->on('textlines.conversation', '=', 'user_conversations.conversationId');
                                $join->on('textlines.lineId', '=', 'user_conversations.lineId');
                            })
                            ->where(['textlines.conversation' => $conversationId,'user_conversations.callable' => 'true', 'user_conversations.user' => $user])
                            ->get();

                        if($conversation->first() != null){
                            $json['success'] = $conversation;
                        }
                        else{
                            $json['error'] = trans("Error when retrieving conversation textlines.");
                        }
                    }
                    else{
                        $json['error'] = trans("Error when retrieving conversation data.");
                    }
                }

            }
            else{
                $json['error'] = trans("Error when retrieving conversation data.");
            }

            echo json_encode($json);
        }
    }

    public function processConversation(){
        //check if conversation has to be updated after accessing it
        if(isset($_POST)){
            $conversation = $_POST['conversation'];
            $user = $_POST['user'];
            //select conversation to see callAfterTrigger to determine if the conversation can be started again or its one-time
            $convData = Textline::where(['lineId' => $conversation['lineId']], ['conversation' => $conversation['conversationId']])->get();
            if($convData->first() != null){

                if($convData[0]['callAfterTrigger'] == "false"){
                    //change callable
                    $calledConversation = UserConversation::where(['lineId' => $conversation['lineId']], ['conversationId' => $conversation['conversationId']], ['user' => $user])->first();
                    $calledConversation->callable = 'false';
                    if($calledConversation->save()){
                        $json['success'] = true;
                    }
                    else{
                        $json['error'] = true;
                    }
                }
            }

            echo json_encode($json);
        }
    }

    public function getMap(){
        //get the current map and position to place the player in
        if(isset($_POST)){
            $json = [];

            $mapId = $_POST['map'];
            $prevMapId = $_POST['prevMap'];
            $nick = $_POST['user'];
            //select map
            $mapSelected = Map::where('id', $mapId)->first();
            if($mapSelected != null){
                //change position of user
                $user = User::where('nick', $nick)->first();
                $user->position = $mapId;
                $user->prevPosition = $prevMapId;
                if($user->save()){
                    //get coordinates
                    $position = MapPosition::where(['prevMap' => $prevMapId, 'currentMap' => $mapId])->first();
                    if($position != null){
                        $json['success'] = $mapSelected;
                        $json['position'] = $position;
                    }
                    else{
                        $json['error'] = "No position";
                    }
                }
                else{
                    $json['error'] = "Can't save new user position";
                }

            }
            else{
                $json['error'] = "Map not found";
            }
        }
        echo json_encode($json);
    }

    public function getEventCode(){
        //get event triggered and process it
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];
            $colorArray = $_POST['color'];
            //convert to HEX
            $color = sprintf("#%02x%02x%02x", $colorArray[0], $colorArray[1], $colorArray[2]); // #hex code
            //use hex code to search for event type and details
            $event = Event::where('eventCode', $color)->first();
            if($event->first() != null){
                //event found
                //create instance of event for user so we can check whether its currently callable or not
                //but first, check if instance already exists
                $eventExistsInUser = UserEvent::where(['eventId' => $event->id, 'user' => $user])->first();
                if($eventExistsInUser == null){
                    $newEvent = new UserEvent;
                    $newEvent->eventId = $event->id;
                    $newEvent->callable = $event->callableDefault;
                    $newEvent->user = $user;
                    if($newEvent->save()){
                        $json['userevent'] = $newEvent;
                    }
                }
                else{
                    $json['userevent'] = $eventExistsInUser;
                }
                $json['success'] = $event;
            }
            else{
                $json['error'] = "No event";
            }

            echo json_encode($json);
        }
    }

    public function getCharacterRoster(){
        //retrieve list of characters belonging to user + all other relevant data
        if(isset($_POST)){
            $user = $_POST['user'];
            if(isset($_POST['pc'])) {
                $charList = DB::table('characters as c')
                    ->select('c.name as char_name','c.position', 'c.id as char_id', 'c.level', 'c.exp', 'c.healthPointsCurrent','c.owner', 'c.staminaPointsCurrent', 'cl.healthpoints', 'cl.staminapoints', 'cl.type', 'sk.name as skill_name', 'sk.description as skill_desc', 'cl.atkMax', 'cl.defMax', 'cl.speedMax')
                    ->join('characterlist as cl', 'c.name', '=', 'cl.name')
                    ->join('skills as sk', 'cl.skill', '=', 'sk.id')
                    ->where(['owner' => $user])
                    ->orderBy('position')
                    ->get();
            }
            else{
                $charList = DB::table('characters as c')
                    ->select('c.name as char_name','c.position', 'c.id as char_id', 'c.level', 'c.exp', 'c.healthPointsCurrent','c.owner', 'c.staminaPointsCurrent', 'cl.healthpoints', 'cl.staminapoints', 'cl.type', 'sk.name as skill_name', 'sk.description as skill_desc', 'cl.atkMax', 'cl.defMax', 'cl.speedMax')
                    ->join('characterlist as cl', 'c.name', '=', 'cl.name')
                    ->join('skills as sk', 'cl.skill', '=', 'sk.id')
                    ->where(['owner' => $user])
                    ->where('position', '<', '6')
                    ->orderBy('position')
                    ->get();
            }
            if($charList->first() != null){
                $movesArray = [];
                foreach($charList as $char){
                    //query
                    $moves = DB::table('moves_users as mu')
                        ->join('moveslist as ml', 'mu.moveId', '=', 'ml.id')
                        ->where('mu.charId', $char->char_id)
                        ->get();
                    if($moves->first() != null){
                        $movesArray[] = $moves;
                    }
                }
                //loop all the instances to get move list for each of them
                $json['success'] = $charList;
                if(!empty($movesArray)){
                    $json['moveList'] = $movesArray;
                }
            }
            else{
                $json['error'] = trans("Error when retrieving characters / No characters");
            }

            echo json_encode($json);
        }
    }

    public function sortCharacters(){
        //change position of characters in database after user has changed them manually
        if(isset($_POST)){
            $pos1 = $_POST['pos1'];
            $pos2 = $_POST['pos2'];
            $user = $_POST['user'];

            $sort1 = Character::where(['position' => $pos1, 'owner' => $user])->first();
            $sort1->position = $pos2;

            $sort2 = Character::where(['position' => $pos2, 'owner' => $user])->first();
            $sort2->position = $pos1;
            if($sort1->save() && $sort2->save()){
                if(isset($_POST['pc'])) {
                    $charList = DB::table('characters as c')
                        ->select('c.name as char_name','c.position', 'c.id as char_id', 'c.level', 'c.exp', 'c.healthPointsCurrent','c.owner', 'c.staminaPointsCurrent', 'cl.healthpoints', 'cl.staminapoints', 'cl.type', 'sk.name as skill_name', 'sk.description as skill_desc', 'cl.atkMax', 'cl.defMax', 'cl.speedMax')
                        ->join('characterlist as cl', 'c.name', '=', 'cl.name')
                        ->join('skills as sk', 'cl.skill', '=', 'sk.id')
                        ->where(['owner' => $user])
                        ->orderBy('position')
                        ->get();
                }
                else{
                    $charList = DB::table('characters as c')
                        ->select('c.name as char_name','c.position', 'c.id as char_id', 'c.level', 'c.exp', 'c.healthPointsCurrent','c.owner', 'c.staminaPointsCurrent', 'cl.healthpoints', 'cl.staminapoints', 'cl.type', 'sk.name as skill_name', 'sk.description as skill_desc', 'cl.atkMax', 'cl.defMax', 'cl.speedMax')
                        ->join('characterlist as cl', 'c.name', '=', 'cl.name')
                        ->join('skills as sk', 'cl.skill', '=', 'sk.id')
                        ->where(['owner' => $user])
                        ->where('position', '<', '6')
                        ->orderBy('position')
                        ->get();
                }
                if($charList->first() != null){
                    $movesArray = [];
                    foreach($charList as $char){
                        //query
                        $moves = DB::table('moves_users as mu')
                            ->join('moveslist as ml', 'mu.moveId', '=', 'ml.id')
                            ->where('mu.charId', $char->char_id)
                            ->get();
                        if($moves->first() != null){
                            $movesArray[] = $moves;
                        }
                    }
                    //loop all the instances to get move list for each of them
                    $json['success'] = $charList;
                    if(!empty($movesArray)){
                        $json['moveList'] = $movesArray;
                    }
                }
                else{
                    $json['error'] = trans("Error when retrieving characters / No characters");
                }

            }
            else{
                $json['error'] = trans("Error when saving positions");

            }
        }
        echo json_encode($json);
    }

    public function healTeam(){
        //update all characters in the team to heal them
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];
            //get all team
            $userTeam = Character::from('characters as c')->select('c.id','c.healthPointsCurrent','cl.healthPoints','c.staminaPointsCurrent','cl.staminaPoints')
                ->join('characterlist as cl', 'c.name', '=', 'cl.name')
                ->where('owner', $user)
                ->where('position', '<', '6')->get();
            foreach($userTeam as $user){
                $userHeal = Character::where(['id'=> $user->id])->first();
                $userHeal->healthPointsCurrent = $user->healthPoints;
                $userHeal->staminaPointsCurrent = $user->staminaPoints;
                if($userHeal->save()){

                }
                else{
                    $json['error'] = "Error when healing";
                }
            }


            echo json_encode($json);

        }
    }

    public function getBuyData(){
        //get information from shop
        if(isset($_POST)){
            $json = [];
            $shopId = $_POST['shopId'];
            $user = $_POST['user'];

            $itemList = Item::where('owner', $shopId)->get();
            if($itemList->first() !== null){
                $balance = User::where('nick', $user)->first();
                if($balance->first() != null){
                    $json['balance'] = $balance;
                }
                $json['success'] = $itemList;
            }
            else{
                $json['error'] = "Error when retrieving shop data";
            }

            echo json_encode($json);
        }
    }

    public function getSellData(){
        //get information from user inventory
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];

            $itemList = Item::where('owner', $user)->get();
            if($itemList->first() !== null){
                $balance = User::where('nick', $user)->first();
                if($balance->first() != null){
                    $json['balance'] = $balance;
                }
                $json['success'] = $itemList;
            }
            else{
                $json['error'] = "Error when retrieving inventory data";
            }

            echo json_encode($json);
        }
    }

    public function buyItem(){
        //process item transaction
        if(isset($_POST)){
            $user = $_POST['user'];
            $itemId = $_POST['item'];
            $stock = $_POST['stock'];

            //get transaction price
            //we dont need owner of shop because item id is unique
            $item = Item::where(['id' => $itemId])->first();
            if($item->first() != null){
                $price = $item->buyPrice * $stock;
                //get maximum position of user inventory to know where we have to place item
                $maxPos = Item::where('owner', $user)->max('positionInventory');
                //see if we already have an item
                $itemUser = Item::where([
                    'owner'=> $user,
                    'name'=> $item->name,
                ])->first();
                if($itemUser !== null){
                    $itemBought = $itemUser;
                }
                else{
                    $itemBought = new Item;
                    $maxPos == null? $itemBought->positionInventory = 0 : $itemBought->positionInventory = $maxPos + 1;
                }
                //get item in user field
                $itemBought->name = $item->name;
                $itemBought->stock += $stock;
                $itemBought->owner = $user;
                $itemBought->buyPrice = $item->buyPrice;
                $itemBought->sellPrice = $item->sellPrice;
                $itemBought->description = $item->description;
                if($itemBought->save()){
                    //update user balance
                    $userData = User::where('nick', $user)->first();
                    $userData->balance -= $price;
                    if($userData->save()){
                        $json['success'] = "Transaction successful";
                    }
                    else{
                        $json['success'] = "Error when updating balance";
                    }
                }
                else{
                    $json['error'] = "Error when saving item";
                }
            }
            else{
                $json['error'] = "Can't find item";
            }

            echo json_encode($json);
        }
    }

    public function sellItem(){
        //process item transaction
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];
            $itemName = $_POST['item'];
            $stock = $_POST['stock'];
            //sell the item, remove quantity from stock
            $itemSold = Item::where([
                'owner'=> $user,
                'name'=> $itemName
            ])->first();
            if($itemSold != null){
                $itemSold->stock -= $stock;
                if($itemSold->stock == 0){
                    //delete item
                    $itemDeleted = Item::where([
                        'owner'=> $user,
                        'name'=> $itemName
                    ])->delete();
                    if(!$itemDeleted){
                        $json['error'] = "Error when deleting";
                    }
                }

                $benefit = $itemSold->sellPrice * $stock;
                if($itemSold->save()){
                    $balanceUpdate = User::where([
                        'nick' => $user
                    ])->first();
                    $balanceUpdate->balance += $benefit;
                    if($balanceUpdate->save()){
                        $json['success'] = "Transaction successful";
                    }
                    else{
                        $json['error'] = "Error when updating balance";

                    }
                }
                else{
                    $json['error'] = "Error when saving item";

                }
            }
            else{
                $json['error'] = "Can't find item";
            }

            echo json_encode($json);
        }
    }

    public function getItems(){
        //get items for inventory
        if(isset($_POST)){
            $user = $_POST['user'];
            //item list
            $itemList = DB::table('items as i')->select('i.name as name', 'i.stock as stock', 'i.description as desc', 'il.category as category', 'il.id as id')
                ->join('itemslist as il', 'i.name', '=', 'il.name')
                ->where('i.owner', $user)
                ->orderBy('i.positionInventory')->get();
            if($itemList->first() != null){
                $json['success'] = $itemList;
            }
            else{
                $json['error'] = "Error when retrieving the item list";
            }

            echo json_encode($json);
        }
    }

    public function useItem(){
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];
            $itemId = $_POST['itemId'];
            $position = $_POST['position'];
            //we have user, itemId, position of character in which we use
            //get item and character

            $itemUse = Item::from('items as i')->select('i.name as name', 'i.stock as stock', 'i.description as desc', 'il.category as category', 'il.id as id')
                ->join('itemslist as il', 'i.name', '=', 'il.name')
                ->where(['i.owner'=> $user, 'il.id'=> $itemId])->first();


            $charUse = Character::from('characters as c')
                ->select('c.name as char_name','c.position', 'c.id as char_id', 'c.level', 'c.exp', 'c.healthPointsCurrent','c.owner', 'c.staminaPointsCurrent', 'cl.healthpoints', 'cl.staminapoints', 'cl.type', 'cl.atkMax', 'cl.defMax', 'cl.speedMax')
                ->join('characterlist as cl', 'c.name', '=', 'cl.name')
                ->where(['owner' => $user, 'position' => $position])
                ->first();
            if($itemUse != null && $charUse != null){
                //check item role with switch
                switch($itemUse->category){
                    case "battle-item":
                        //add stuff if battle items are added
                        break;
                    case "heal_item":
                        //check if heal needed
                        if($charUse->healthPointsCurrent != $charUse->healthpoints){
                            //heal possible, switch with all heal_item possibilities
                            switch($itemId){
                                //INDIVIDUAL CASES FOR EACH ITEM, EACH ITEM CAN BE UNIQUE
                                //AND HAVE DIFFERENT EFFECTS, WHICH CAN BE ADDED BELOW HERE
                                case '2':
                                    //heal 20 hp
                                    $healthLeftToMax = $charUse->healthpoints - $charUse->healthPointsCurrent;
                                    if(20 > $healthLeftToMax){
                                        $heal = 20 - $healthLeftToMax;
                                    }
                                    else{
                                        $heal = 20;
                                    }
                                    $heal += $charUse->healthPointsCurrent;
                                    $charSave = Character::where(['owner'=> $user, 'position' => $position])->update(['healthPointsCurrent' => $heal]);
                                    if($charSave > 0){
                                        //delete item from inventory
                                        $itemUsed = Item::where(['name'=> $itemUse->name, 'owner' => $user])->first();
                                        if($itemUsed !== null){
                                            $itemUsed->stock -= 1;
                                            if($itemUsed->stock == 0){
                                                //delete item
                                                $itemDeleted = Item::where([
                                                    'owner'=> $user,
                                                    'name'=> $itemUsed->name
                                                ])->delete();
                                                if(!$itemDeleted){
                                                    $json['error'] = "Error when deleting";
                                                }
                                            }
                                            else{
                                                if($itemUsed->save()){
                                                    $json['success'] = "Item used successfully";
                                                }
                                            }
                                        }
                                    }
                                    else{
                                        $json['error'] = "Error when saving character";
                                    }
                                    break;
                                case '3':
                                    //heal 50 hp
                                    $healthLeftToMax = $charUse->healthpoints - $charUse->healthPointsCurrent;
                                    if(50 > $healthLeftToMax){
                                        $heal = 50 - $healthLeftToMax;
                                    }
                                    else{
                                        $heal = 50;
                                    }
                                    $heal += $charUse->healthPointsCurrent;
                                    $charSave = Character::where(['owner'=> $user, 'position' => $position])->update(['healthPointsCurrent' => $heal]);
                                    if($charSave > 0){
                                        //delete item from inventory
                                        $itemUsed = Item::where(['name'=> $itemUse->name, 'owner' => $user])->first();
                                        if($itemUsed !== null){
                                            $itemUsed->stock -= 1;
                                            if($itemUsed->stock == 0){
                                                //delete item
                                                $itemDeleted = Item::where([
                                                    'owner'=> $user,
                                                    'name'=> $itemUsed->name
                                                ])->delete();
                                                if(!$itemDeleted){
                                                    $json['error'] = "Error when deleting";
                                                }
                                            }
                                            else{
                                                if($itemUsed->save()){
                                                    $json['success'] = "Item used successfully";
                                                }
                                                else{
                                                    $json['error'] = "Error when using item";
                                                }
                                            }
                                        }
                                        else{
                                            $json['error'] = "Error when retrieving item used";
                                        }
                                    }
                                    else{
                                        $json['error'] = "Error when saving character";
                                    }
                                    break;
                            }
                        }
                        else{
                            $json['error'] = "Character already healed";
                        }
                }
            }
            else{
                $json['error'] = "Error when retrieving item or character";
            }

            echo json_encode($json);
        }
    }

    public function getDataCard(){
        //get information to show data card
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];

            $cardData = User::where(['nick' => $user])->first();
            if($cardData != null){
                $json['success'] = $cardData;
            }
            else{
                $json['error'] = "Error when retrieving information";
            }

            echo json_encode($json);
        }
    }

    public function chooseSprite(){
        //function to choose gender of character at the start of the game
        if(isset($_POST)){
            $user = $_POST['user'];
            $sprite = $_POST['sprite'];

            $userData = User::where(['nick' => $user])->first();
            $userData->sprite = $sprite;
            if($userData->save()){
                $json['success'] = "Updated successfully";
            }
            else{
                $json['error'] = "Error when updating sprite";
            }

            echo json_encode($json);
        }
    }

    public function getCharacter(){
        if(isset($_POST)){
            $json = [];
            isset($_POST['charData'])? $charData = $_POST['charData'] : '';
            //this method can be entered in two ways, when we capture a character, or when we're given one, which is one instance thus far, we read the instance
            $user = $_POST['user'];
            $instance = $_POST['instance'];

            if(isset($charData)){
                //receive character by using the values we've received TODO
            }
            else{
                //check which instance of a given character is this
                switch($instance){
                    case 1:
                        //first character is Reimu Lv.5, standard, default.
                        //get all relevant data and save it, character data, moves data.
                        $newCharacter = new Character;
                        $newCharacter->name = 'Reimu';
                        $newCharacter->owner = $user;
                        $newCharacter->position = 0;
                        $newCharacter->exp = 5000;
                        $newCharacter->level = 5;
                        $newCharacter->healthPointsCurrent = 300;
                        $newCharacter->staminaPointsCurrent = 300;
                        if($newCharacter->save()){
                            //get moves now
                            //moves 1,2
                            //get current id of saved character
                            $arrayMoves = [1,2];
                            $newCharData = Character::where(['owner'=> $user, 'position' => 0])->first();
                            for($i=0; $i<count($arrayMoves); $i++){
                                $newCharMoves = new MovesUser;
                                $newCharMoves->charId = $newCharData->id;
                                $newCharMoves->moveId = $arrayMoves[$i];
                                $newCharMoves->user = $user;
                                if($newCharMoves->save()){

                                }
                                else{
                                    $json['error'] = "Error when saving moves";
                                }
                            }
                            //done saving everything, user should have his character all set
                            if(!isset($json['error'])){
                                $json['success'] = true;
                            }
                        }
                        else{
                            $json['error'] = "Error when saving character";
                        }
                        break;
                        //there might be more cases of given characters in the future, and it can just be added with another case
                    default:
                        $json['error'] = "Bad instance";
                        break;

                }
            }
            echo json_encode($json);
        }
    }

    public function toggleCallable(){
        if(isset($_POST)){
            $json = [];
            $user = $_POST['user'];
            $eventId = $_POST['eventId'];
            //method meant to toggle callable methods, pass event id, all it does is switch from false to true and true to false
            //first check if the event has already been triggered by the user, if not, create it
            $eventCalled = UserEvent::where(['eventId' => $eventId, 'user' => $user])->first();
            if(!$eventCalled){
                //event doesnt exist, create it
                //select default event to know in which callable state it is by default
                $eventDefault = Event::where(['id' => $eventId])->first();
                if($eventDefault){
                    //create event and toggle it
                    $newUserEvent = new UserEvent;
                    $newUserEvent->eventId = $eventDefault->id;
                    $newUserEvent->callable = $eventDefault->callableDefault;
                    $newUserEvent->user = $user;
                    if($newUserEvent->callable == "true"){
                        $newUserEvent->callable = 'false';
                    }
                    else if($newUserEvent->callable == "false"){
                        $newUserEvent->callable = 'true';
                    }
                    //save event and we're done
                    if($newUserEvent->save()){
                        $json['success'] = true;
                    }
                    else{
                        $json['error'] = "Error when saving newly created event";
                    }
                }
                else{
                    $json['error'] = "Error when finding default event";
                }
            }
            else{
                //event exists, just reference it
                $userEventCalled = UserEvent::where(['eventId' => $eventId, 'user' => $user])->first();
                if($userEventCalled){
                    if($userEventCalled->callable == "true"){
                        $userEventCalled->callable = "false";
                    }
                    else{
                        $userEventCalled->callable = "true";
                    }
                    //save
                    if($userEventCalled->save()){
                        $json['success'] = true;
                    }
                    else{
                        $json['error'] = "Error when updating event callable";
                    }
                }
                else{
                    $json['error'] = "Error when finding user event";
                }
            }

            echo json_encode($json);
        }
    }

    public function getBattleData(){
        if(isset($_POST)){
            $user = $_POST['trainer'];
            $rival = $_POST['rival'];
            $arrayUser = [];
            $arrayRival = [];
            //get battle data
            //attributes we need for battling
            //everything from characters
            //skills data
            //moves of the user + move data
            //we save all of this in an array of as many characters as the user has available until it reaches 6
            //this array is modifiable, which means we can do stuff like stat changes with a simple variable reassignment
            //instead of having to modify the database
            //ideally, this query will give us a collection with all the data we want and the characters, which we can then convert to an array
            $trainerData = Character::from('characters as c')
                ->select('c.name as char_name','c.id as char_id', 'c.owner as owner', 'c.position as position', 'c.exp as exp',
                    'c.level as level', 'c.healthPointsCurrent as healthPoints', 'c.staminaPointsCurrent as staminaPoints',
                    'sk.name as skill_name', 'sk.description as skill_desc','sk.id as skill_id', 'cl.atkMax as atkMax', 'cl.defMax as defMax', 'cl.speedMax as speedMax', 'cl.healthPoints as maxHealth', 'cl.staminaPoints as maxStamina', 'cl.type as type')
                ->join('characterlist as cl', 'c.name', '=', 'cl.name')
                ->join('skills as sk', 'cl.skill', '=', 'sk.id')
                ->where('c.owner', $user)
                ->where('position', '<', '6')
                ->orderBy('position')
                ->get();
            if($trainerData->first() != null){
                //loop collection, get moves for each of them, save them in a separate part of the array
                $i=0;
                foreach($trainerData as $char){
                    //query
                    $moves = DB::table('moves_users as mu')
                        ->join('moveslist as ml', 'mu.moveId', '=', 'ml.id')
                        ->where('mu.charId', $char->char_id)
                        ->get();
                    if($moves->first() != null){
                        $arrayUser[$i]['data'] = $char;
                        $arrayUser[$i]['moves'] = $moves;
                        $i++;
                        //saves in each index
                    }
                }
                if(!empty($arrayUser)){

                    //get rival data now
                    //yeah, this is duplicated code, sorry :(

                    $rivalData = Character::from('characters as c')
                        ->select('c.name as char_name','c.id as char_id', 'c.owner as owner', 'c.position as position', 'c.exp as exp',
                            'c.level as level', 'c.healthPointsCurrent as healthPoints', 'c.staminaPointsCurrent as staminaPoints',
                            'sk.name as skill_name','sk.id as skill_id', 'sk.description as skill_desc', 'cl.atkMax as atkMax', 'cl.defMax as defMax', 'cl.speedMax as speedMax', 'cl.healthPoints as maxHealth', 'cl.staminaPoints as maxStamina', 'cl.type as type')
                        ->join('characterlist as cl', 'c.name', '=', 'cl.name')
                        ->join('skills as sk', 'cl.skill', '=', 'sk.id')
                        ->where('c.owner', $rival)
                        ->where('position', '<', '6')
                        ->orderBy('position')
                        ->get();
                    if($rivalData->first() != null){
                        //loop collection, get moves for each of them, save them in a separate part of the array
                        $i = 0;
                        foreach($rivalData as $char){
                            //query
                            $moves = DB::table('moves_users as mu')
                                ->join('moveslist as ml', 'mu.moveId', '=', 'ml.id')
                                ->where('mu.charId', $char->char_id)
                                ->get();
                            if($moves->first() != null){
                                $arrayRival[$i]['data'] = $char;
                                $arrayRival[$i]['moves'] = $moves;
                                $i++;
                                //saves in each index
                            }
                        }
                        if(!empty($arrayRival)){
                            //we gathered all the data, assign json
                            $json['success'] = [$arrayUser, $arrayRival];
                        }
                        else{
                            $json['error'] = "Error when retrieving rival data";
                        }
                    }
                    else {
                        $json['error'] = "Rival data not found";
                    }
                }
                else{
                    $json['error'] = "Error when retrieving trainer data";
                }
                //loop all the instances to get move list for each of them
            }
            else{
                $json['error'] = "Trainer data not found";
            }

            echo json_encode($json);
        }
    }

    public function updateData(){
        if(isset($_POST)){
            //update the post-battle data and check everything
            $data = $_POST['data'];
            $user = $_POST['user'];

            $characterList = Character::where(['owner' => $user])
                ->where('position', '<', '6')->get();
            //whole list of characters, update all relevant fields
            $i=0;
            foreach($characterList as $char){

                //query
                if($data[$i]['data']['exp'] > 1000){
                    $char->exp = 1000 - $data[$i]['data']['exp'];
                    $char->level += 1;
                }
                $char->healthPointsCurrent = $data[$i]['data']['healthPoints'];
                $char->staminaPointsCurrent = $data[$i]['data']['staminaPoints'];

                if($char->save()){
                    $i++;
                }
                else{
                    $json['error'] = "Error when updating a character";
                }
            }
            if(!isset($json['error'])){
                $json['success'] = true;
            }
            echo json_encode($json);
        }
    }

    public function getMapData(){
        if(isset($_POST)){
            //only for battle related
            $mapId = $_POST['mapId'];
            $json = [];

            $mapData = Map::where(['id' => $mapId])->first();
            if($mapData){
                $json['success'] = $mapData;
            }
            else{
                $json['error'] = "Error when retrieving map data.";
            }
            echo json_encode($json);

        }
    }

    public function createWildCharacter(){
        if(isset($_POST)){
            $charId = $_POST['charId'];
            $charLevel  = $_POST['charLevel'];
            $user = $_POST['user'];
            $owner = "temp_". $user;
            //unique identifier for this specific character

            //get data from character id
            $newCharData = CharacterList::where(['id' => $charId])->first();
                //enter the character itself
                $newCharacter = new Character;
                $newCharacter->name = $newCharData->name;
                $newCharacter->owner = $owner;
                $newCharacter->position = 0;
                $newCharacter->exp = $charLevel * 1000;
                $newCharacter->level = $charLevel;
                $newCharacter->healthPointsCurrent = $newCharData->healthPoints;
                $newCharacter->staminaPointsCurrent = $newCharData->staminaPoints;
                if($newCharacter->save()){
                    $movesNewChar = MovesCharacter::where(['charId' => $charId])
                        ->where('learnedAt', '<', $charLevel)->take('4')->get();
                    //select new character to get id
                    $newChar = Character::where(['owner' => $owner, 'position' => 0])->first();
                    if($movesNewChar->first() != null){
                        //input moves
                        foreach($movesNewChar as $move){
                            $newMove = new MovesUser;
                            $newMove->charId = $newChar->id;
                            $newMove->moveId = $move->id;
                            $newMove->user = $owner;
                            if($newMove->save()){

                            }
                            else{
                                $json['error'] = "Error when saving new move";
                            }
                        }
                }
                else{
                    $json['error'] = "Error when saving new character";
                }

                    if(!isset($json['error'])){
                        $json['success'] = true;
                    }

            }

            echo json_encode($json);
        }
    }

    public function getCapturedChar(){
        if(isset($_POST)){
            $user = $_POST['user'];
            $rival = $_POST['rivalId'];

            $maxPos = Character::where('owner', $user)->max('position');
            $charCaptured = Character::where(['position' => 0, 'owner' => $rival])->first();
            $charCaptured->owner = $user;
            $charCaptured->position = $maxPos+1;
            if($charCaptured->save()){
                $movesCharCaptured = MovesUser::where(['user' => $rival])->get();
                foreach($movesCharCaptured as $move){
                    $move->user = $user;
                    if($move->save()){
                    }
                    else{
                        $json['error'] = true;
                    }
                }
            }
            else{
                $json['error'] = true;
            }

            if(!isset($json['error'])){
                $json['success'] = true;
            }
            echo json_encode($json);
        }
    }

    public function deleteTempChar(){
        if(isset($_POST)){
            $id = $_POST['tempUser'];
            $delete1 = Character::where(['owner' => $id])->delete();
            $delete2 = MovesUser::where(['owner' => $id])->delete();
            if($delete1 && $delete2){
                $json['success'] = true;
            }
            else{
                $json['error'] = true;
            }
            echo json_encode($json);
        }
    }
}


