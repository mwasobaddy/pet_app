<?php

namespace App\Http\Controllers;

use App\Http\Requests\NotificationIndexRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    public function index(NotificationIndexRequest $request): JsonResponse
    {
        $user = $request->user();
        $cursor = $request->validated()['cursor'] ?? null;
        $perPage = 20;

        $pagination = $user->notifications()
            ->latest()
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor)
            ->withQueryString();

        $notifications = collect($pagination->items())
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'type' => class_basename($notification->type),
                'read_at' => $notification->read_at?->toISOString(),
                'created_at' => $notification->created_at?->toISOString(),
                'data' => $notification->data,
            ])
            ->values();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
            'meta' => [
                'next_cursor' => optional($pagination->nextCursor())->encode(),
                'has_more' => $pagination->hasMorePages(),
                'per_page' => $pagination->perPage(),
            ],
        ]);
    }

    public function markRead(Request $request, string $notification): JsonResponse
    {
        $notificationModel = $request->user()->notifications()->findOrFail($notification);
        $notificationModel->markAsRead();

        return response()->json(['success' => true]);
    }
}
