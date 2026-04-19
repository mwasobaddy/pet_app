<?php

use App\Http\Middleware\CheckNoPetProfile;
use App\Http\Middleware\CheckUserTier;
use App\Models\MessageWallPost;
use App\Models\MessageWallTag;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutMiddleware([CheckUserTier::class, CheckNoPetProfile::class]);
});

function createPetProfile(User $user, PetType $petType, string $name = 'Pet'): PetProfile
{
    return PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => $petType->id,
        'name' => $name,
        'age' => 2,
        'gender' => 'Unknown',
        'description' => 'Test pet profile',
    ]);
}

test('message wall index returns latest sorted posts by default', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    $firstPost = MessageWallPost::create([
        'user_id' => $user->id,
        'pet_profile_id' => createPetProfile($user, $petType, 'Buddy')->id,
        'body' => 'First post',
        'created_at' => now()->subHour(),
        'updated_at' => now()->subHour(),
    ]);

    $secondPost = MessageWallPost::create([
        'user_id' => $user->id,
        'pet_profile_id' => createPetProfile($user, $petType, 'Rocky')->id,
        'body' => 'Second post',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = $this->getJson(route('message-wall.index'));

    $response->assertSuccessful();
    $response->assertJsonPath('posts.0.id', $secondPost->id);
    $response->assertJsonPath('posts.1.id', $firstPost->id);
});

test('message wall supports popular sorting', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $petType = PetType::create(['name' => 'Cat', 'icon' => '🐈']);

    $lessPopular = MessageWallPost::create([
        'user_id' => $user->id,
        'pet_profile_id' => createPetProfile($user, $petType, 'Milo')->id,
        'body' => 'Less popular post',
        'likes_count' => 2,
        'comments_count' => 1,
        'shares_count' => 0,
    ]);

    $morePopular = MessageWallPost::create([
        'user_id' => $user->id,
        'pet_profile_id' => createPetProfile($user, $petType, 'Luna')->id,
        'body' => 'More popular post',
        'likes_count' => 20,
        'comments_count' => 3,
        'shares_count' => 5,
    ]);

    $response = $this->getJson(route('message-wall.index', ['sort' => 'popular']));

    $response->assertSuccessful();
    $response->assertJsonPath('posts.0.id', $morePopular->id);
    $response->assertJsonPath('posts.1.id', $lessPopular->id);
});

test('message wall supports pet category and tag filtering', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $dogType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);
    $catType = PetType::create(['name' => 'Cat', 'icon' => '🐈']);

    $tagFriendly = MessageWallTag::create(['name' => 'friendly', 'slug' => 'friendly']);
    $tagCalm = MessageWallTag::create(['name' => 'calm', 'slug' => 'calm']);

    $dogPost = MessageWallPost::create([
        'user_id' => $user->id,
        'pet_profile_id' => createPetProfile($user, $dogType, 'Cooper')->id,
        'body' => 'Dog post',
    ]);
    $dogPost->tags()->sync([$tagFriendly->id]);

    $catPost = MessageWallPost::create([
        'user_id' => $user->id,
        'pet_profile_id' => createPetProfile($user, $catType, 'Shadow')->id,
        'body' => 'Cat post',
    ]);
    $catPost->tags()->sync([$tagCalm->id]);

    $response = $this->getJson(route('message-wall.index', [
        'pet_category' => $dogType->id,
        'tags' => [$tagFriendly->id],
    ]));

    $response->assertSuccessful();
    $response->assertJsonCount(1, 'posts');
    $response->assertJsonPath('posts.0.id', $dogPost->id);
});

test('like interaction toggles and updates counts', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $petType = PetType::create(['name' => 'Bird', 'icon' => '🐦']);
    $post = MessageWallPost::create([
        'user_id' => $user->id,
        'pet_profile_id' => createPetProfile($user, $petType, 'Kiwi')->id,
        'body' => 'Likeable post',
    ]);

    $firstResponse = $this->postJson(route('message-wall.posts.like', ['messageWallPost' => $post->id]));
    $firstResponse->assertSuccessful();
    $firstResponse->assertJsonPath('liked', true);

    $secondResponse = $this->postJson(route('message-wall.posts.like', ['messageWallPost' => $post->id]));
    $secondResponse->assertSuccessful();
    $secondResponse->assertJsonPath('liked', false);
});

test('comment interaction increments post comments count', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $petType = PetType::create(['name' => 'Rabbit', 'icon' => '🐇']);
    $post = MessageWallPost::create([
        'user_id' => $user->id,
        'pet_profile_id' => createPetProfile($user, $petType, 'Nibbles')->id,
        'body' => 'Commentable post',
    ]);

    $response = $this->postJson(route('message-wall.posts.comment', ['messageWallPost' => $post->id]), [
        'body' => 'Great post!',
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('success', true);

    $post->refresh();
    expect($post->comments_count)->toBe(1);
});
