<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RolePermissionSeeder::class);

        // Seed tiers
        $this->call(TierSeeder::class);

        // Seed pet types and personality tags
        $this->call(PetTypeSeeder::class);
        $this->call(PetPersonalityTagSeeder::class);

        // Seed test users with complete profiles
        $this->call(UserSeeder::class);

        // Seed pet profiles with images and personality tags
        $this->call(PetProfileSeeder::class);

        // Seed pet interactions and matches for testing swipe functionality
        $this->call(PetInteractionSeeder::class);

        // Seed message wall data (posts, comments, interactions, follows)
        $this->call(MessageWallSeeder::class);
    }
}
