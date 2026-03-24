<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://localhost:8080'), '/');
            $email = urlencode((string) $notifiable->getEmailForPasswordReset());
            $tokenEncoded = urlencode($token);

            return $frontendUrl . '/reset-password?token=' . $tokenEncoded . '&email=' . $email;
        });
    }
}
