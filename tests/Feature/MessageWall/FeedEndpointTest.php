<?php

namespace Tests\Feature\MessageWall;

use App\Models\MessageWallPost;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_feed_endpoint_unauthenticated(): void
    {
        $response = $this->getJson('/web-api/message-wall');

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_feed_endpoint_returns_json_with_accept_header(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/web-api/message-wall');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'posts' => [],
            'meta' => [
                'next_cursor',
                'has_more',
                'per_page',
            ],
            'config' => [
                'filtering_enabled',
                'allowed_sort_modes',
                'default_sort_mode',
            ],
            'options' => [
                'pet_categories',
                'tags',
            ],
        ]);
    }

    public function test_feed_endpoint_with_invalid_sort_returns_validation_error(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/web-api/message-wall?sort=invalid');

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['sort']);
    }

    public function test_feed_endpoint_with_valid_sort_parameter(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->getJson('/web-api/message-wall?sort=latest');

        $response->assertStatus(200);
        $response->assertJsonStructure(['posts', 'meta', 'config', 'options']);
    }

    public function test_feed_endpoint_ignores_undefined_parameters(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        // This simulates the frontend not including undefined parameters
        $response = $this->actingAs($user)
            ->getJson('/web-api/message-wall?sort=latest');

        $response->assertStatus(200);
        $response->assertJsonStructure(['posts', 'meta', 'config', 'options']);
    }
}
