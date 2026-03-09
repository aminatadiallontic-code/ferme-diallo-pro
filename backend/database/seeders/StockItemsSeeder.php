<?php

namespace Database\Seeders;

use App\Models\StockItem;
use Illuminate\Database\Seeder;

class StockItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            [
                'name' => 'Maïs',
                'category' => 'aliments',
                'quantity' => 0,
                'unit' => 'kg',
                'threshold' => 10,
                'last_update' => now()->toDateString(),
            ],
            [
                'name' => 'Riz',
                'category' => 'aliments',
                'quantity' => 0,
                'unit' => 'kg',
                'threshold' => 10,
                'last_update' => now()->toDateString(),
            ],
            [
                'name' => 'Aliment poulet (granulés)',
                'category' => 'aliments',
                'quantity' => 0,
                'unit' => 'kg',
                'threshold' => 20,
                'last_update' => now()->toDateString(),
            ],
            [
                'name' => 'Vermifuge',
                'category' => 'vaccins',
                'quantity' => 0,
                'unit' => 'dose',
                'threshold' => 5,
                'last_update' => now()->toDateString(),
            ],
            [
                'name' => 'Antibiotique',
                'category' => 'vaccins',
                'quantity' => 0,
                'unit' => 'dose',
                'threshold' => 5,
                'last_update' => now()->toDateString(),
            ],
            [
                'name' => 'Œufs',
                'category' => 'oeufs',
                'quantity' => 0,
                'unit' => 'plateau',
                'threshold' => 2,
                'last_update' => now()->toDateString(),
            ],
        ];

        foreach ($items as $item) {
            StockItem::updateOrCreate(
                ['name' => $item['name'], 'category' => $item['category']],
                $item,
            );
        }
    }
}
