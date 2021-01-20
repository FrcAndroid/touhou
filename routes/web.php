<?php

use App\Ban;
use App\Character;
use App\Report;
use App\User;
use App\Warning;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/welcome', function () {
    return view('welcome');
});

Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

Route::post('validateField','Auth\RegisterController@validateField');

Route::post('/edit/uploadUserFile','UserController@upload');
Route::post('/edit/editUser','UserController@edit');
Route::post('/edit/sendMessage','UserController@send');
Route::post('/edit/sendReport','UserController@report');



Route::get('setlocale/{locale}', function ($locale) {
    if (in_array($locale, Config::get('app.locales'))) {
        session(['locale' => $locale]);
    }
    return redirect()->back();
});

Route::get('/u/{username}', function($username){
    $userExists = User::where('nick', $username)->first();
    $userOwns = Character::where('owner', $username);
    $pastWarnings = Warning::where('user', $username)->get();
    $pastBans = Ban::where(['status' => 'Resolved','user' => $username])->get();

    $currentBans = Ban::where(['user' => $username,'status' => 'Active']);
    $isBanned = "false";
    if($currentBans->first() != null){
        $isBanned = 'true';
    }

    $isUser = "false";
    if(Auth::check()){//remember a guest can also see profiles
        if(Auth::user()->nick == $username){
            $isUser = "true";
        }
    }

    return view('user', compact('username', 'userExists', 'userOwns', 'isUser', 'pastBans', 'pastWarnings', 'isBanned'));
});

Route::post('/load/loadMessages','AuthController@loadMessages');
Route::post('/load/loadMessageList','AuthController@loadMessageList');
Route::post('/load/loadMessage','AuthController@loadMessage');
Route::post('/load/getReplyData','AuthController@getReplyData');


Route::get('/adminpanel',function(){
    //send user list to show on the admin panel
    $usersList = User::all();
    $reportsList = Report::all();
    $bansList = Ban::all();

    return view('admin', compact('usersList', 'reportsList', 'bansList'));
});

Route::post('/admin/getReports', 'AdminController@getReports');
Route::post('/admin/getIndividualReport', 'AdminController@getIndividualReport');
Route::post('/admin/processReport', 'AdminController@processReport');

Route::post('/admin/getBans', 'AdminController@getBans');
Route::post('/admin/processBan', 'AdminController@processBan');

Route::post('/admin/getHistory', 'AdminController@getHistory');

Route::post('/admin/addWarning', 'AdminController@addWarning');
Route::post('/admin/addBan', 'AdminController@addBan');


//PLAY-RELATED ROUTES
Route::get('/play',['middleware' => 'auth', function(){
    $user = Auth::user()->nick;

    return view('play', compact('user'));
}]);

Route::post('/play/getData', 'GameController@getData');
Route::post('/play/getConversation', 'GameController@getConversation');
Route::post('/play/processConversation', 'GameController@processConversation');
Route::post('/play/getMap', 'GameController@getMap');
Route::post('/play/getEventCode', 'GameController@getEventCode');
Route::post('/play/getCharacterRoster', 'GameController@getCharacterRoster');
Route::post('/play/sortCharacters', 'GameController@sortCharacters');
Route::post('/play/healTeam', 'GameController@healTeam');
Route::post('/play/getBuyData', 'GameController@getBuyData');
Route::post('/play/getSellData', 'GameController@getSellData');
Route::post('/play/buyItem', 'GameController@buyItem');
Route::post('/play/sellItem', 'GameController@sellItem');
Route::post('/play/getItems', 'GameController@getItems');
Route::post('/play/useItem', 'GameController@useItem');
Route::post('/play/getDataCard', 'GameController@getDataCard');
Route::post('/play/chooseSprite', 'GameController@chooseSprite');
Route::post('/play/getCharacter', 'GameController@getCharacter');
Route::post('/play/toggleCallable', 'GameController@toggleCallable');
Route::post('/play/getBattleData', 'GameController@getBattleData');
Route::post('/play/updateData', 'GameController@updateData');
Route::post('/play/getMapData', 'GameController@getMapData');
Route::post('/play/createWildCharacter', 'GameController@createWildCharacter');
Route::post('/play/getCapturedChar', 'GameController@getCapturedChar');
Route::post('/play/deleteTempChar', 'GameController@deleteTempChar');

