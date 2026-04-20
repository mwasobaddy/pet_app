<?php

namespace App\Http\Controllers\Debug;

use App\Http\Controllers\Controller;
use App\Notifications\MessageWallCommentReplyNotification;
use App\Notifications\PostCommentedNotification;
use App\Notifications\PostLikedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RealtimeNotificationsDebugController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        $recent = $user->notifications()
            ->latest()
            ->limit(10)
            ->get();

        $trackedNotificationTypes = [
            PostLikedNotification::class,
            PostCommentedNotification::class,
            MessageWallCommentReplyNotification::class,
        ];

        $trackedCount = $user->notifications()
            ->whereIn('type', $trackedNotificationTypes)
            ->count();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'broadcast_channel' => $user->receivesBroadcastNotificationsOn(),
            ],
            'runtime' => [
                'app_env' => app()->environment(),
                'broadcast_connection' => config('broadcasting.default'),
                'queue_connection' => config('queue.default'),
            ],
            'reverb' => [
                'configured' => config('broadcasting.default') === 'reverb',
                'host' => config('broadcasting.connections.reverb.options.host'),
                'port' => config('broadcasting.connections.reverb.options.port'),
                'scheme' => config('broadcasting.connections.reverb.options.scheme'),
                'app_key_present' => filled(config('broadcasting.connections.reverb.key')),
                'app_secret_present' => filled(config('broadcasting.connections.reverb.secret')),
            ],
            'notifications' => [
                'total' => $user->notifications()->count(),
                'unread' => $user->unreadNotifications()->count(),
                'tracked_total' => $trackedCount,
                'recent' => $recent->map(fn ($notification) => [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'read_at' => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at?->toISOString(),
                    'data_type' => $notification->data['type'] ?? null,
                    'has_message' => isset($notification->data['message']),
                ])->values(),
            ],
        ]);
    }
}
