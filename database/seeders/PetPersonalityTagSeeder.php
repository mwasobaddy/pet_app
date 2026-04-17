<?php

namespace Database\Seeders;

use App\Models\PetPersonalityTag;
use Illuminate\Database\Seeder;

class PetPersonalityTagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Playful', 'description' => 'Loves to play and is full of energy'],
            ['name' => 'Affectionate', 'description' => 'Loving and enjoys cuddling'],
            ['name' => 'Shy', 'description' => 'Reserved and timid around others'],
            ['name' => 'Intelligent', 'description' => 'Smart and quick learner'],
            ['name' => 'Friendly', 'description' => 'Gets along well with people and animals'],
            ['name' => 'Mischievous', 'description' => 'Gets into trouble and causes mischief'],
            ['name' => 'Calm', 'description' => 'Relaxed and easygoing'],
            ['name' => 'Energetic', 'description' => 'Always active and hyper'],
            ['name' => 'Independent', 'description' => 'Prefers to do things alone'],
            ['name' => 'Social', 'description' => 'Loves being around others'],
            ['name' => 'Aggressive', 'description' => 'Dominant and sometimes territorial'],
            ['name' => 'Protective', 'description' => 'Guards family and territory'],
            ['name' => 'Stubborn', 'description' => 'Determined and difficult to train'],
            ['name' => 'Gentle', 'description' => 'Soft-natured and kind'],
            ['name' => 'Curious', 'description' => 'Always exploring and investigating'],
        ];

        foreach ($tags as $tag) {
            PetPersonalityTag::firstOrCreate(['name' => $tag['name']], $tag);
        }
    }
}
