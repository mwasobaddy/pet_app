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
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        $user = auth()->user();

        // Check if user has any role (tier selected)
        if ($user && !$user->hasAnyRole('free_user|premium_user|elite_user')) {
            return redirect()->route('subscription.select');
        }

        return $next($request);
    }

    /**
     * Determine if the request should skip the tier check.
     */
    private function shouldSkip(Request $request): bool
    {
        if (!auth()->check()) {
            return true;
        }

        $routeName = $request->route()?->getName() ?? '';

        return in_array($routeName, $this->except);
    }
}
