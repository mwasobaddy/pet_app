<?php

namespace App\Http\Controllers\Api;

use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController
{
    public function __construct(private AuthService $authService) {}

    /**
     * Login user and return API token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'required|string',
        ]);

        $user = $this->authService->validateCredentials(
            $credentials['email'],
            $credentials['password'],
        );

        $token = $this->authService->createToken($user, $credentials['device_name']);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Register a new user and return API token.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'device_name' => 'required|string',
        ]);

        $user = $this->authService->registerUser($validated);
        $token = $this->authService->createToken($user, $validated['device_name']);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->revokeToken($request->user('sanctum'));

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get current authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user('sanctum'));
    }

    /**
     * Revoke all user tokens (logout from all devices).
     */
    public function revokeAllTokens(Request $request): JsonResponse
    {
        $this->authService->revokeAllTokens($request->user('sanctum'));

        return response()->json([
            'message' => 'All tokens revoked successfully.',
        ]);
    }
}
