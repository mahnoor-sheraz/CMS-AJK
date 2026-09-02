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
            [
                'name' => 'Muzaffarabad',
                'name_ur' => 'مظفرآباد',
                'tehsils' => [
                    ['name' => 'Muzaffarabad', 'name_ur' => 'مظفرآباد'],
                    ['name' => 'Naseerabad', 'name_ur' => 'نصیرآباد'],
                ],
            ],
            [
                'name' => 'Neelum',
                'name_ur' => 'نیلم',
                'tehsils' => [
                    ['name' => 'Athmuqam', 'name_ur' => 'آٹھمقام'],
                    ['name' => 'Sharda', 'name_ur' => 'شاردا'],
                ],
            ],
            [
                'name' => 'Jhelum Valley (Hattian Bala)',
                'name_ur' => 'وادی جہلم (ہٹیاں بالا)',
                'tehsils' => [
                    ['name' => 'Hattian', 'name_ur' => 'ہٹیاں'],
                    ['name' => 'Chikar', 'name_ur' => 'چکار'],
                    ['name' => 'Leepa', 'name_ur' => 'لیپہ'],
                ],
            ],
            [
                'name' => 'Bagh',
                'name_ur' => 'باغ',
                'tehsils' => [
                    ['name' => 'Bagh', 'name_ur' => 'باغ'],
                    ['name' => 'Dhirkot', 'name_ur' => 'دھیرکوٹ'],
                    ['name' => 'Harighel', 'name_ur' => 'ہڑی گہل'],
                ],
            ],
            [
                'name' => 'Haveli',
                'name_ur' => 'حویلی',
                'tehsils' => [
                    ['name' => 'Haveli', 'name_ur' => 'حویلی'],
                    ['name' => 'Khurshidabad', 'name_ur' => 'خورشیدآباد'],
                    ['name' => 'Mumtazabad', 'name_ur' => 'ممتازآباد'],
                ],
            ],
            [
                'name' => 'Poonch',
                'name_ur' => 'پونچھ',
                'tehsils' => [
                    ['name' => 'Rawalakot', 'name_ur' => 'راولاکوٹ'],
                    ['name' => 'Hajira', 'name_ur' => 'ہجیرہ'],
                    ['name' => 'Abbaspur', 'name_ur' => 'عباس پور'],
                    ['name' => 'Thorar', 'name_ur' => 'تھوڑار'],
                ],
            ],
            [
                'name' => 'Sudhnuti',
                'name_ur' => 'سدھنوتی',
                'tehsils' => [
                    ['name' => 'Pallandri', 'name_ur' => 'پلندری'],
                    ['name' => 'Mong', 'name_ur' => 'منگ'],
                    ['name' => 'Tararkhal', 'name_ur' => 'تراڑ کھل'],
                    ['name' => 'Baloch', 'name_ur' => 'بلوچ'],
                ],
            ],
            [
                'name' => 'Mirpur',
                'name_ur' => 'میرپور',
                'tehsils' => [
                    ['name' => 'Mirpur', 'name_ur' => 'میرپور'],
                    ['name' => 'Dudyal', 'name_ur' => 'ڈڈیال'],
                ],
            ],
            [
                'name' => 'Kotli',
                'name_ur' => 'کوٹلی',
                'tehsils' => [
                    ['name' => 'Kotli', 'name_ur' => 'کوٹلی'],
                    ['name' => 'Khuiratta', 'name_ur' => 'خوئی رٹہ'],
                    ['name' => 'Charhoi', 'name_ur' => 'چڑھوئی'],
                    ['name' => 'Darlia Jattan', 'name_ur' => 'ڈہلیا جٹاں'],
                    ['name' => 'Sehnsa', 'name_ur' => 'سہنسہ'],
                    ['name' => 'Fatehpur Thakyala', 'name_ur' => 'فتح پور تھکیالہ'],
                ],
            ],
            [
                'name' => 'Bhimber',
                'name_ur' => 'بھمبر',
                'tehsils' => [
                    ['name' => 'Bhimber', 'name_ur' => 'بھمبر'],
                    ['name' => 'Barnala', 'name_ur' => 'برنالہ'],
                    ['name' => 'Samahni', 'name_ur' => 'سماہنی'],
                ],
            ],
        ];

        foreach ($districtsWithTehsils as $districtData) {
            $district = District::updateOrCreate(
                ['name' => $districtData['name']],
                ['name_ur' => $districtData['name_ur']]
            );

            foreach ($districtData['tehsils'] as $tehsilData) {
                Tehsil::updateOrCreate(
                    [
                        'district_id' => $district->id,
                        'name' => $tehsilData['name'],
                    ],
                    [
                        'name_ur' => $tehsilData['name_ur'],
                    ]
                );
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
