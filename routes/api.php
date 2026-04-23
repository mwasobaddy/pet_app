<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MatchingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\MessageWallController;
use App\Http\Controllers\MessageWallInteractionController;
use App\Http\Controllers\NotificationsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    // User endpoints
    Route::get('/user', function (Request $request) {
        return $request->user('sanctum');
    });
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/tokens/revoke-all', [AuthController::class, 'revokeAllTokens']);

    // Matching/Swipe Routes
    Route::prefix('matching')->name('matching.')->group(function () {
        Route::get('recommendations', [MatchingController::class, 'recommendations'])->name('recommendations');
        Route::post('interaction', [MatchingController::class, 'recordInteraction'])->name('recordInteraction');
        Route::get('matches', [MatchingController::class, 'getMatches'])->name('getMatches');
    });

    // Analytics Routes
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('summary', [AnalyticsController::class, 'summary'])->name('summary');
    });

    // Notification Routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationsController::class, 'index'])->name('index');
        Route::post('{notification}/read', [NotificationsController::class, 'markRead'])->name('read');
    });

    // Message Wall Routes
    Route::prefix('message-wall')->name('message-wall.')->group(function () {
        Route::get('/', [MessageWallController::class, 'index'])->name('index');
        Route::post('posts', [MessageWallController::class, 'store'])->name('posts.store');
        Route::post('posts/{messageWallPost}/like', [MessageWallInteractionController::class, 'like'])->name('posts.like');
        Route::post('posts/{messageWallPost}/comment', [MessageWallInteractionController::class, 'comment'])->name('posts.comment');
        Route::post('posts/{messageWallPost}/share', [MessageWallInteractionController::class, 'share'])->name('posts.share');
        Route::post('posts/{messageWallPost}/save', [MessageWallInteractionController::class, 'save'])->name('posts.save');
        Route::post('users/{user}/follow', [MessageWallInteractionController::class, 'follow'])->name('users.follow');
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
