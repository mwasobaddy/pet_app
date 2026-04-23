<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('API Authentication', function () {
    describe('Login', function () {
        it('returns 422 for invalid credentials', function () {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'nonexistent@example.com',
                'password' => 'wrong-password',
                'device_name' => 'iPhone',
            ]);

            $response->assertStatus(422);
        });

        it('returns 422 if email not verified', function () {
            $user = User::factory()->unverified()->create([
                'email' => 'user@example.com',
                'password' => bcrypt('password'),
            ]);

            $response = $this->postJson('/api/auth/login', [
                'email' => 'user@example.com',
                'password' => 'password',
                'device_name' => 'iPhone',
            ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors('email');
        });

        it('returns token for valid credentials', function () {
            $user = User::factory()->create([
                'email' => 'user@example.com',
                'password' => bcrypt('password'),
            ]);

            $response = $this->postJson('/api/auth/login', [
                'email' => 'user@example.com',
                'password' => 'password',
                'device_name' => 'iPhone',
            ]);

            $response->assertStatus(200);
            $response->assertJsonStructure([
                'user' => ['id', 'email', 'first_name'],
                'token',
            ]);
            $response->assertJsonPath('user.email', 'user@example.com');
        });

        it('creates new personal access token', function () {
            $user = User::factory()->create([
                'password' => bcrypt('password'),
            ]);

            $this->postJson('/api/auth/login', [
                'email' => $user->email,
                'password' => 'password',
                'device_name' => 'iPhone',
            ]);

            $this->assertDatabaseHas('personal_access_tokens', [
                'tokenable_id' => $user->id,
                'name' => 'iPhone',
            ]);
        });
    });

    describe('Register', function () {
        it('returns 422 for invalid input', function () {
            $response = $this->postJson('/api/auth/register', [
                'first_name' => '',
                'email' => 'invalid-email',
                'password' => 'short',
                'device_name' => 'iPhone',
            ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors(['first_name', 'email', 'password']);
        });

        it('returns 422 for duplicate email', function () {
            User::factory()->create(['email' => 'existing@example.com']);

            $response = $this->postJson('/api/auth/register', [
                'first_name' => 'John',
                'email' => 'existing@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'device_name' => 'iPhone',
            ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors('email');
        });

        it('returns 422 if password confirmation does not match', function () {
            $response = $this->postJson('/api/auth/register', [
                'first_name' => 'John',
                'email' => 'new@example.com',
                'password' => 'password123',
                'password_confirmation' => 'different',
                'device_name' => 'iPhone',
            ]);

            $response->assertStatus(422);
            $response->assertJsonValidationErrors('password');
        });

        it('creates new user and returns token', function () {
            $response = $this->postJson('/api/auth/register', [
                'first_name' => 'John',
                'other_names' => 'Doe',
                'email' => 'john@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'device_name' => 'iPhone',
            ]);

            $response->assertStatus(201);
            $response->assertJsonStructure([
                'user' => ['id', 'email', 'first_name'],
                'token',
            ]);
            $this->assertDatabaseHas('users', [
                'email' => 'john@example.com',
                'first_name' => 'John',
                'other_names' => 'Doe',
            ]);
        });
    });

    describe('Logout', function () {
        it('revokes current token', function () {
            $user = User::factory()->create();
            $token = $user->createToken('test-device')->plainTextToken;

            $response = $this->withHeader('Authorization', "Bearer {$token}")
                ->postJson('/api/auth/logout');

            $response->assertStatus(200);
            $this->assertDatabaseMissing('personal_access_tokens', [
                'tokenable_id' => $user->id,
            ]);
        });

        it('returns 401 without token', function () {
            $response = $this->postJson('/api/auth/logout');

            $response->assertStatus(401);
        });
    });

    describe('Revoke All Tokens', function () {
        it('revokes all user tokens', function () {
            $user = User::factory()->create();
            $token1 = $user->createToken('device-1')->plainTextToken;
            $token2 = $user->createToken('device-2')->plainTextToken;

            $this->withHeader('Authorization', "Bearer {$token1}")
                ->postJson('/api/auth/tokens/revoke-all');

            $this->assertDatabaseMissing('personal_access_tokens', [
                'tokenable_id' => $user->id,
            ]);
        });
    });

    describe('Get User', function () {
        it('returns authenticated user', function () {
            $user = User::factory()->create();
            $token = $user->createToken('test-device')->plainTextToken;

            $response = $this->withHeader('Authorization', "Bearer {$token}")
                ->getJson('/api/user');

            $response->assertStatus(200);
            $response->assertJsonPath('email', $user->email);
        });

        it('returns 401 without token', function () {
            $response = $this->getJson('/api/user');

            $response->assertStatus(401);
        });
    });
});
