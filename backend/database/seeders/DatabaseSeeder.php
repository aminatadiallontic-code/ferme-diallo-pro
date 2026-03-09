<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use Database\Seeders\StockItemsSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Mamadou Diallo',
                'password' => Hash::make('Di@llo2026'),
                'role' => 'fermier',
                'status' => 'actif',
            ],
        );

        User::updateOrCreate(
            ['email' => 'gestionnaire@gmail.com'],
            [
                'name' => 'Ibrahima Sow',
                'password' => Hash::make('Gest@2026'),
                'role' => 'gestionnaire',
                'status' => 'actif',
            ],
        );

        $this->call([
            StockItemsSeeder::class,
        ]);
    }
}
