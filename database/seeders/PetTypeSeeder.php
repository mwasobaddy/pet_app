<?php

namespace Database\Seeders;

use App\Models\PetType;
use Illuminate\Database\Seeder;

class PetTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $petTypes = [
            ['name' => 'Dog', 'icon' => '🐕'],
            ['name' => 'Cat', 'icon' => '🐈'],
            ['name' => 'Bird', 'icon' => '🦜'],
            ['name' => 'Rabbit', 'icon' => '🐰'],
            ['name' => 'Guinea Pig', 'icon' => '🐹'],
            ['name' => 'Hamster', 'icon' => '🐹'],
            ['name' => 'Fish', 'icon' => '🐠'],
            ['name' => 'Reptile', 'icon' => '🦎'],
            ['name' => 'Other', 'icon' => '🐾'],
        ];

        foreach ($petTypes as $type) {
            PetType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}
