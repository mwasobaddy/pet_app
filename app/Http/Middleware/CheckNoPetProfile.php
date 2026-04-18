<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckNoPetProfile
{
    /**
     * Routes that should be excluded from pet profile check.
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
        'profile.edit',
        'profile.update',
        'profile.destroy',
        'security.edit',
        'user-password.update',
        'pets.create',
        'pets.store',
        'pets.index',
        'pets.show',
        'pets.edit',
        'pets.update',
        'pets.destroy',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only check for authenticated users with complete profiles
        if (! auth()->check()) {
            return $next($request);
        }

        $route = $request->route()?->getName();

        // Skip check for excluded routes
        if ($route && in_array($route, $this->except)) {
            return $next($request);
        }

        $user = auth()->user();

        // Check if user has no pet profiles
        if ($user->petProfiles()->count() === 0) {
            return redirect()->route('pets.create')
                ->with('info', 'Create your first pet profile to get started!');
        }

        return $next($request);
    }
}
