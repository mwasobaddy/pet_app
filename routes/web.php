<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MatchingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\PetProfileController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Google OAuth routes
Route::get('auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Pet Profile Routes
    Route::prefix('pets')->name('pets.')->group(function () {
        Route::get('/', [PetProfileController::class, 'index'])->name('index');
        Route::get('create', [PetProfileController::class, 'create'])->name('create');
        Route::post('/', [PetProfileController::class, 'store'])->name('store');
        Route::get('{petProfile}', [PetProfileController::class, 'show'])->name('show');
        Route::get('{petProfile}/edit', [PetProfileController::class, 'edit'])->name('edit');
        Route::patch('{petProfile}', [PetProfileController::class, 'update'])->name('update');
        Route::delete('{petProfile}', [PetProfileController::class, 'destroy'])->name('destroy');
    });

    // Matching/Swipe Routes (API)
    Route::prefix('api/matching')->name('matching.')->group(function () {
        Route::get('recommendations', [MatchingController::class, 'recommendations'])->name('recommendations');
        Route::post('interaction', [MatchingController::class, 'recordInteraction'])->name('recordInteraction');
        Route::get('matches', [MatchingController::class, 'getMatches'])->name('getMatches');
    });

    // Analytics Routes (API)
    Route::prefix('api/analytics')->name('analytics.')->group(function () {
        Route::get('summary', [AnalyticsController::class, 'summary'])->name('summary');
    });

    // Notification Routes (API)
    Route::prefix('api/notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationsController::class, 'index'])->name('index');
        Route::post('{notification}/read', [NotificationsController::class, 'markRead'])->name('read');
    });

    // Chat Routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::get('match/{match}', [ChatController::class, 'showByMatch'])->name('match');
        Route::get('{conversation}', [ChatController::class, 'show'])->name('show');
        Route::post('{conversation}/messages', [MessageController::class, 'store'])->name('messages.store');
        Route::post('{conversation}/read', [MessageController::class, 'markRead'])->name('messages.read');
    });
});


require __DIR__.'/settings.php';
