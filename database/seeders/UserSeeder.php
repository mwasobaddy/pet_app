<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create test users with complete profiles
        $usersData = [
            [
                'email' => 'alice@example.com',
                'first_name' => 'Alice',
                'other_names' => 'Johnson',
                'mobile_number' => '+1234567890',
            ],
            [
                'email' => 'kelvinramsiel01@gmail.com',
                'first_name' => 'Bob',
                'other_names' => 'Smith',
                'mobile_number' => '+1234567891',
            ],
            [
                'email' => 'charlie@example.com',
                'first_name' => 'Charlie',
                'other_names' => 'Brown',
                'mobile_number' => '+1234567892',
            ],
            [
                'email' => 'kelvinramsiel@gmail.com',
                'first_name' => 'Diana',
                'other_names' => 'Prince',
                'mobile_number' => '+1234567893',
            ],
            [
                'email' => 'eve@example.com',
                'first_name' => 'Eve',
                'other_names' => 'Williams',
                'mobile_number' => '+1234567894',
            ],
            [
                'email' => 'frank@example.com',
                'first_name' => 'Frank',
                'other_names' => 'Davis',
                'mobile_number' => '+1234567895',
            ],
        ];

        foreach ($usersData as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    ...$userData,
                    'password' => bcrypt('password123'),
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
