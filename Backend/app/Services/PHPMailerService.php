<?php
// File: Backend/app/Services/PHPMailerService.php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use App\Models\User; // Untuk type hinting

class PHPMailerService 
{
    /**
     * Mengirim email selamat datang menggunakan PHPMailer.
     * @param User $user
     * @return bool
     */
    public function sendWelcomeEmail(User $user): bool
    {
        $mail = new PHPMailer(true);

        try {
            // Pengaturan Server (Kita gunakan konfigurasi Gmail)
            $mail->isSMTP();
            $mail->Host       = env('MAIL_HOST', 'smtp.gmail.com'); 
            $mail->SMTPAuth   = true;
            
            // [PENTING] Gunakan Sandi Aplikasi Gmail
            $mail->Username   = env('MAIL_USERNAME'); 
            $mail->Password   = env('MAIL_PASSWORD'); 
            
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
            $mail->Port       = env('MAIL_PORT', 587);

            // Pengirim (From)
            $mail->setFrom(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));

            // Penerima (To)
            $mail->addAddress($user->email, $user->full_name);

            // Konten Email
            $mail->isHTML(true); 
            $mail->Subject = 'Selamat Datang di Katalog Buku!';
            $mail->Body    = "<h1>Selamat, {$user->full_name}!</h1>"
                             . "<p>Akun Anda telah berhasil terdaftar di aplikasi kami. Silakan masuk untuk mulai menjelajahi koleksi buku kami.</p>";
            $mail->AltBody = "Selamat {$user->full_name}! Akun Anda telah berhasil terdaftar di aplikasi kami.";

            $mail->send();
            return true;

        } catch (Exception $e) {
            // Catat error ini ke log Laravel
            \Illuminate\Support\Facades\Log::error("PHPMailer Gagal: {$mail->ErrorInfo}");
            return false;
        }
    }
}