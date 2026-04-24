<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSanctumOrSessionAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Attempt to authenticate with different guards
        $guards = ['web', 'sanctum'];
        
        foreach ($guards as $guard) {
            try {
                if ($request->user($guard)) {
                    // User authenticated with this guard
                    return $next($request);
                }
            } catch (AuthenticationException $e) {
                // Continue to next guard
                continue;
            }
        }

        // No authentication succeeded
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
