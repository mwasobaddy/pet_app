<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserTier
{
    /**
     * Routes that should be excluded from tier check.
     */
    private array $except = [
        'home',
        'logout',
        'verification.send',
        'verification.notice',
        'verification.verify',
        'password.request',
        'password.email',
        'password.update',
        'password.reset',
        'password.confirm',
        'password.confirm.store',
        'password.confirmation',
        'two-factor.login',
        'two-factor.login.store',
        'two-factor.confirm',
        'two-factor.enable',
        'two-factor.disable',
        'two-factor.qr-code',
        'two-factor.recovery-codes',
        'two-factor.regenerate-recovery-codes',
        'two-factor.secret-key',
        'subscription.select',
        'subscription.store',
        'subscription.payment',
        'subscription.complete',
        'profile.incomplete',
        'profile.complete',
        // Web-API routes (JSON endpoints for frontend)
        'web-api.matching.recommendations',
        'web-api.matching.recordInteraction',
        'web-api.matching.getMatches',
        'web-api.message-wall.index',
        'web-api.message-wall.posts.store',
        'web-api.message-wall.posts.like',
        'web-api.message-wall.posts.comment',
        'web-api.message-wall.posts.share',
        'web-api.message-wall.posts.save',
        'web-api.message-wall.users.follow',
        'web-api.notifications.index',
        'web-api.notifications.read',
        'web-api.chat.index',
        'web-api.chat.match',
        'web-api.chat.show',
        'web-api.chat.messages.store',
        'web-api.chat.messages.read',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        $user = auth()->user();

        // Check if user has any role (tier selected)
        if ($user && ! $user->hasAnyRole('free_user|vip_user|svip_user')) {
            return redirect()->guest(route('subscription.select'));
        }

        return $next($request);
    }

    /**
     * Determine if the request should skip the tier check.
     */
    private function shouldSkip(Request $request): bool
    {
        if (! auth()->check()) {
            return true;
        }

        $routeName = $request->route()?->getName() ?? '';

        return in_array($routeName, $this->except);
    }
}
