<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIncompleteProfile
{
    /**
     * Routes that should be excluded from profile check.
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
        // Only check for authenticated users
        if (! auth()->check()) {
            return $next($request);
        }

        $route = $request->route()?->getName();

        // Skip check for excluded routes
        if ($route && in_array($route, $this->except)) {
            return $next($request);
        }

        $user = auth()->user();

        if (blank($user->google_id)) {
            return $next($request);
        }

        // Check if profile is incomplete
        if (! $this->isProfileComplete($user)) {
            return redirect()->route('profile.incomplete')
                ->with('warning', 'Please complete your profile to continue.');
        }

        return $next($request);
    }

    private function isProfileComplete($user): bool
    {
        return ! empty($user->first_name)
            && ! empty($user->other_names)
            && ! empty($user->mobile_number)
            && $user->password_set_at !== null;
    }
}
