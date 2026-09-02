<?php

namespace Database\Seeders;

use App\Models\Channel;
use App\Models\District;
use App\Models\ForwardDestination;
use App\Models\Tehsil;
use Illuminate\Database\Seeder;

class LookupTablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $districtsWithTehsils = [
            'Muzaffarabad' => [
                'Muzaffarabad',
                'Naseerabad',
            ],
            'Neelum' => [
                'Athmuqam',
                'Sharda',
            ],
            'Jhelum Valley (Hattian Bala)' => [
                'Hattian',
                'Chikar',
                'Leepa',
            ],
            'Bagh' => [
                'Bagh',
                'Dhirkot',
                'Harighel',
            ],
            'Haveli' => [
                'Haveli',
                'Khurshidabad',
                'Mumtazabad',
            ],
            'Poonch' => [
                'Rawalakot',
                'Hajira',
                'Abbaspur',
                'Thorar',
            ],
            'Sudhnuti' => [
                'Pallandri',
                'Mong',
                'Tararkhal',
                'Baloch',
            ],
            'Mirpur' => [
                'Mirpur',
                'Dudyal',
            ],
            'Kotli' => [
                'Kotli',
                'Khuiratta',
                'Charhoi',
                'Darlia Jattan',
                'Sehnsa',
                'Fatehpur Thakyala',
            ],
            'Bhimber' => [
                'Bhimber',
                'Barnala',
                'Samahni',
            ],
        ];

        foreach ($districtsWithTehsils as $districtName => $tehsils) {
            $district = District::firstOrCreate(['name' => $districtName]);

            foreach ($tehsils as $tehsilName) {
                Tehsil::firstOrCreate([
                    'district_id' => $district->id,
                    'name' => $tehsilName,
                ]);
            }
        }

        $channels = [
            'Web',
            'Mobile App',
            'Call Center',
            'Khuli Kachahry',
        ];

        foreach ($channels as $channelName) {
            Channel::firstOrCreate(['name' => $channelName]);
        }

        $destinations = [
            'Federal',
            'AJK Service Tribunal',
            'Consumer Court',
            'Anti-Corruption',
            'Overseas',
            'Other',
        ];

        foreach ($destinations as $destinationName) {
            ForwardDestination::firstOrCreate(['name' => $destinationName]);
        }
    }
}
