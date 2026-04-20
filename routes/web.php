<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Debug\RealtimeNotificationsDebugController;
use App\Http\Controllers\MatchingController;
use App\Http\Controllers\MatchingPreferenceController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\MessageWallController;
use App\Http\Controllers\MessageWallInteractionController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\PetProfileController;
use App\Http\Controllers\ProfileCompletionController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Middleware\EnsureMatchingPreferencesSet;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Google OAuth routes
Route::get('auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

// Subscription routes (auth but not tier-checked yet)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('subscription', [SubscriptionController::class, 'select'])->name('subscription.select');
    Route::post('subscription/{tier}', [SubscriptionController::class, 'store'])->name('subscription.store');
    Route::get('subscription/{tier}/payment', [SubscriptionController::class, 'payment'])->name('subscription.payment');
    Route::post('subscription/{tier}/complete', [SubscriptionController::class, 'complete'])->name('subscription.complete');

    // Incomplete profile page
    Route::inertia('profile/incomplete', 'profile/incomplete')->name('profile.incomplete');
    Route::patch('profile/incomplete', [ProfileCompletionController::class, 'update'])->name('profile.complete');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware([EnsureMatchingPreferencesSet::class])->group(function () {
        Route::inertia('discover', 'discover')->name('discover');
    });

    Route::get('matching/preferences', [MatchingPreferenceController::class, 'index'])
        ->name('matching.preferences');
    Route::post('matching/preferences', [MatchingPreferenceController::class, 'store'])
        ->name('matching.preferences.store');

    Route::inertia('feed', 'feed')->name('feed');
    Route::inertia('feed/create', 'feed/create')->name('feed.create');
    Route::get('feed/comments/{messageWallPost}', [MessageWallController::class, 'show'])->name('feed.comments.show');
    Route::inertia('notifications', 'notifications/index')->name('notifications');

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

    // Debug Routes (API)
    Route::prefix('api/debug')->name('debug.')->group(function () {
        Route::get('realtime-notifications', RealtimeNotificationsDebugController::class)
            ->name('realtime-notifications');
    });

    // Chat Routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::get('match/{match}', [ChatController::class, 'showByMatch'])->name('match');
        Route::get('{conversation}', [ChatController::class, 'show'])->name('show');
        Route::post('{conversation}/messages', [MessageController::class, 'store'])->name('messages.store');
        Route::post('{conversation}/read', [MessageController::class, 'markRead'])->name('messages.read');
    });

    // Message Wall Routes (API)
    Route::prefix('api/message-wall')->name('message-wall.')->group(function () {
        Route::get('/', [MessageWallController::class, 'index'])->name('index');
        Route::post('posts', [MessageWallController::class, 'store'])->name('posts.store');
        Route::post('posts/{messageWallPost}/like', [MessageWallInteractionController::class, 'like'])->name('posts.like');
        Route::post('posts/{messageWallPost}/comment', [MessageWallInteractionController::class, 'comment'])->name('posts.comment');
        Route::post('posts/{messageWallPost}/share', [MessageWallInteractionController::class, 'share'])->name('posts.share');
        Route::post('posts/{messageWallPost}/save', [MessageWallInteractionController::class, 'save'])->name('posts.save');
        Route::post('users/{user}/follow', [MessageWallInteractionController::class, 'follow'])->name('users.follow');
    });
});

require __DIR__.'/settings.php';
