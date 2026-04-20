<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMatchingPreferencesSet
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->check()) {
            return $next($request);
        }

        $user = auth()->user();
        $preference = $user->matchingPreference;

        if (! $preference) {
            return redirect()->route('matching.preferences')
                ->with('warning', 'Please set your matching preferences before accessing Discover.');
        }

        return $next($request);
    }
}
