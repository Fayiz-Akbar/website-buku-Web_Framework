<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'full_name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6','confirmed'],
        ]);

        $user = User::create([
            'full_name' => $data['full_name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
        ]);

        return response()->json(['message' => 'Registrasi berhasil.','user' => $user], 201);
    }

    public function login(Request $request)
    {
        $creds = $request->validate(['email'=>'required|email','password'=>'required']);
        $user = User::where('email',$creds['email'])->first();
        if (!$user || !Hash::check($creds['password'],$user->password)) {
            return response()->json(['message'=>'Kredensial salah'], 422);
        }
        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token'=>$token,'user'=>$user]);
    }

    public function user(Request $request) { return response()->json($request->user()); }
}
