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
                    ['name' => 'Athmuqam', 'name_ur' => 'ایتھمقام'],
                    ['name' => 'Sharda', 'name_ur' => 'شاردہ'],
                ],
            ],
            [
                'name' => 'Jhelum Valley (Hattian Bala)',
                'name_ur' => 'وادیٔ جہلم (ہٹیاں بالا)',
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
                    ['name' => 'Harighel', 'name_ur' => 'ہڑی گلہ'],
                ],
            ],
            [
                'name' => 'Haveli',
                'name_ur' => 'حویلی',
                'tehsils' => [
                    ['name' => 'Haveli', 'name_ur' => 'حویلی'],
                    ['name' => 'Khurshidabad', 'name_ur' => 'خورشید آباد'],
                    ['name' => 'Mumtazabad', 'name_ur' => 'ممتاز آباد'],
                ],
            ],
            [
                'name' => 'Poonch',
                'name_ur' => 'پونچھ (راولاکوٹ)',
                'tehsils' => [
                    ['name' => 'Rawalakot', 'name_ur' => 'راولاکوٹ'],
                    ['name' => 'Hajira', 'name_ur' => 'ہاجرہ'],
                    ['name' => 'Abbaspur', 'name_ur' => 'عباسپور'],
                    ['name' => 'Thorar', 'name_ur' => 'تھوراڑ'],
                ],
            ],
            [
                'name' => 'Sudhnuti',
                'name_ur' => 'سدھنوتی',
                'tehsils' => [
                    ['name' => 'Pallandri', 'name_ur' => 'پلندری'],
                    ['name' => 'Mong', 'name_ur' => 'مونگ'],
                    ['name' => 'Tararkhal', 'name_ur' => 'تراڑکھل'],
                    ['name' => 'Baloch', 'name_ur' => 'بلوچ'],
                ],
            ],
            [
                'name' => 'Mirpur',
                'name_ur' => 'میرپور',
                'tehsils' => [
                    ['name' => 'Mirpur', 'name_ur' => 'میرپور'],
                    ['name' => 'Dudyal', 'name_ur' => 'دودیال'],
                ],
            ],
            [
                'name' => 'Kotli',
                'name_ur' => 'کوٹلی',
                'tehsils' => [
                    ['name' => 'Kotli', 'name_ur' => 'کوٹلی'],
                    ['name' => 'Khuiratta', 'name_ur' => 'کھوئیرٹہ'],
                    ['name' => 'Charhoi', 'name_ur' => 'چڑھوئی'],
                    ['name' => 'Darlia Jattan', 'name_ur' => 'درولیہ جاٹاں'],
                    ['name' => 'Sehnsa', 'name_ur' => 'سہنسہ'],
                    ['name' => 'Fatehpur Thakyala', 'name_ur' => 'فتح پور ٹھکیالہ'],
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
