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

    public function validarCampo(){
        //validamos el campo especifico y enviamos mensaje error o exito
        $json = [];
        $valor = $_POST['value'];
        $campo = $_POST['campo'];
        if($campo == "nick"){
            //validamos el nombre del usuario de forma manual, utilizaremos validate solo en form submit
            if(!empty($valor)){
                //comprobamos longitud
                if(strlen($valor) > 3 && strlen($valor) < 16){
                    //finalmente comprobamos que no esté en la lista de usuarios
                    $usuarios = User::where('nick', $valor)->first();
                    if(!$usuarios){
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
        if($campo == "email"){
            //validamos el email de forma manual, utilizaremos validate solo en form submit
            if(!empty($valor)){
                //comprobamos longitud
                if (filter_var($valor, FILTER_VALIDATE_EMAIL)) {
                    //finalmente comprobamos que no esté en la lista de usuarios
                    $emails = User::where('email', $valor)->first();
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
        if($campo == "password" || $campo == "password-confirm"){
            if(!empty($valor)){
                if(strlen($valor)>3){
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
