<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'nick' => ['required', 'string', 'min:3', 'max:16', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:4', 'confirmed'],
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    protected function create(array $data)
    {
        return User::create([
            'nick' => $data['nick'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'created_at' => date(now())
        ]);


    }

    public function validateFields(){
        //validate specific field and send error message in case it's not valid
        $json = [];
        $value = $_POST['value'];
        $field = $_POST['field'];
        if($field == "nick"){
            //we manually validate the username, using validate only on form submit
            if(!empty($value)){
                //check length of username
                if(strlen($value) > 3 && strlen($value) < 16){
                    //check username is unique
                    $users = User::where('nick', $value)->first();
                    if(!$users){
                        $json['success'] = trans("Valid user.");
                    }
                    else{
                        $json['error'] = trans("The user already exists.");
                    }
                }
                else{
                    $json['error'] = trans("User length not allowed.");
                }
            }
            else{
                $json['error'] = trans("Username cannot be empty.");
            }

            echo json_encode($json);

        }
        if($field == "email"){
            //we validate e-mail individually, using the validate only on form submit
            if(!empty($value)){
                //check length and validity of mail
                if (filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    //check email doesnt belong to any user
                    $emails = User::where('email', $value)->first();
                    if(!$emails){
                        $json['success'] = trans("Valid e-mail.");
                    }
                    else{
                        $json['error'] = trans("This e-mail is already in use");
                    }
                }
                else{
                    $json['error'] = trans("Invalid e-mail.");
                }
            }
            else{
                $json['error'] = trans("E-mail cannot be empty.");
            }

            echo json_encode($json);

        }
        if($field == "password" || $field == "password-confirm"){
            if(!empty($value)){
                if(strlen($value)>3){
                    $json['success'] = trans("Valid password.");
                }
                else{
                    $json['error'] = trans("The password is too short.");
                }
            }
            else{
                $json['error'] = trans("Password cannot be empty.");
            }

            echo json_encode($json);
        }
    }
}
