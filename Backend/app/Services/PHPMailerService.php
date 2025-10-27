<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Illuminate\Support\Facades\Log;

class PHPMailerService
{
    public function sendWelcomeEmail(string $toEmail, string $toName = 'User'): bool
    {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = env('MAIL_HOST', 'smtp.gmail.com');
            $mail->SMTPAuth   = true;
            $mail->Username   = env('MAIL_USERNAME');
            $mail->Password   = env('MAIL_PASSWORD');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS 587
            $mail->Port       = (int) env('MAIL_PORT', 587);
            $mail->CharSet    = 'UTF-8';

            // Opsi dev jika sertifikat lokal bermasalah:
            // $mail->SMTPOptions = ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]];

            $from = env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME'));
            $fromName = env('MAIL_FROM_NAME', 'App');
            $mail->setFrom($from, $fromName);
            $mail->addAddress($toEmail, $toName);

            $mail->isHTML(true);
            $mail->Subject = 'Pendaftaran Berhasil';
            $mail->Body    = '<h3>Selamat datang!</h3><p>Akun Anda berhasil dibuat.</p>';
            $mail->AltBody = 'Selamat datang! Akun Anda berhasil dibuat.';

            return $mail->send();
        } catch (Exception $e) {
            Log::error('PHPMailer error: '.$e->getMessage());
            return false;
        }
    }
}