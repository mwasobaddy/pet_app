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
        'profile.edit',
        'profile.update',
        'profile.destroy',
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

        // Check if profile is incomplete
        if (! $this->isProfileComplete($user)) {
            return redirect()->route('profile.edit')
                ->with('warning', 'Please complete your profile to continue.');
        }

        return $next($request);
    }

    private function isProfileComplete($user): bool
    {
        return ! empty($user->first_name)
            && ! empty($user->other_names)
            && ! empty($user->mobile_number);
    }
}
