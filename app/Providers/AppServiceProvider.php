<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
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
        Vite::prefetch(concurrency: 3);

        if (
            request()->header('x-forwarded-proto') === 'https' ||
            request()->isSecure() ||
            str_contains((string) request()->header('host'), 'lhr.life') ||
            str_contains((string) request()->header('host'), 'ngrok') ||
            str_contains((string) request()->header('host'), 'loca.lt')
        ) {
            URL::forceScheme('https');
        }
    }
}
