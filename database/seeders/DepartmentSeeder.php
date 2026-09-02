<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Department;
use App\Models\SubDepartment;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departmentsData = [
            [
                'name' => 'Health Department',
                'name_ur' => 'محکمہ صحت',
                'code' => 'HLT',
                'display_order' => 1,
                'sub_departments' => [
                    ['name' => 'DHQ Hospitals', 'name_ur' => 'ڈی ایچ کیو ہسپتال'],
                    ['name' => 'THQ Hospitals & Basic Health Units', 'name_ur' => 'ٹی ایچ کیو ہسپتال و بنیادی صحت مراکز'],
                ],
                'categories' => [
                    [
                        'name' => 'Medicine Shortage',
                        'name_ur' => 'ادویات کی قلت',
                        'sub_categories' => [
                            ['name' => 'Life Saving Drugs', 'name_ur' => 'زندگی بچانے والی ادویات'],
                            ['name' => 'General Medicine', 'name_ur' => 'عام ادویات'],
                        ],
                    ],
                    [
                        'name' => 'Staff Absence & Misbehavior',
                        'name_ur' => 'عملے کی غیر حاضری و بدسلوکی',
                    ],
                ],
            ],
            [
                'name' => 'Elementary & Secondary Education',
                'name_ur' => 'محکمہ ایلیمنٹری و سیکنڈری ایجوکیشن',
                'code' => 'EDU',
                'display_order' => 2,
                'sub_departments' => [
                    ['name' => 'Boys Schools', 'name_ur' => 'بوائز سکولز'],
                    ['name' => 'Girls Schools', 'name_ur' => 'گرلز سکولز'],
                ],
                'categories' => [
                    [
                        'name' => 'Teacher Shortage / Absence',
                        'name_ur' => 'اساتذہ کی قلت یا غیر حاضری',
                    ],
                    [
                        'name' => 'Building & Infrastructure Defect',
                        'name_ur' => 'عمارت کی خستہ حالی و بنیادی سہولیات',
                    ],
                ],
            ],
            [
                'name' => 'Electricity & Power Department',
                'name_ur' => 'محکمہ برقیات (بجلی)',
                'code' => 'PWR',
                'display_order' => 3,
                'sub_departments' => [
                    ['name' => 'Distribution & Maintenance', 'name_ur' => 'توزیع و دیکھ بھال'],
                    ['name' => 'Billing & Metering', 'name_ur' => 'بلنگ و میٹرنگ'],
                ],
                'categories' => [
                    [
                        'name' => 'Unscheduled Load Shedding',
                        'name_ur' => 'بغیر شیڈول لوڈ شیڈنگ',
                    ],
                    [
                        'name' => 'Transformer Fault / Overbilling',
                        'name_ur' => 'ٹرانسفارمر کی خرابی یا غلط بلنگ',
                    ],
                ],
            ],
            [
                'name' => 'Revenue & Land Records',
                'name_ur' => 'محکمہ مال و اراضی پٹوار',
                'code' => 'REV',
                'display_order' => 4,
                'sub_departments' => [
                    ['name' => 'Patwar & Land Mutation', 'name_ur' => 'پٹوار و انتقالِ اراضی'],
                    ['name' => 'Registration & Stamp Paper', 'name_ur' => 'رجسٹریشن و اسٹامپ پیپر'],
                ],
                'categories' => [
                    [
                        'name' => 'Fard Distribution Delay',
                        'name_ur' => 'فرد کے اجراء میں تاخیر',
                    ],
                    [
                        'name' => 'Illegal Encroachment / Mutation Dispute',
                        'name_ur' => 'ناجائز قبضہ یا تنازعِ انتقال',
                    ],
                ],
            ],
            [
                'name' => 'Physical Planning & Housing (PPH)',
                'name_ur' => 'محکمہ فزیکل پلاننگ اینڈ ہاؤسنگ',
                'code' => 'PPH',
                'display_order' => 5,
                'sub_departments' => [
                    ['name' => 'Water Supply & Sanitation', 'name_ur' => 'واٹر سپلائی و سینی ٹیشن'],
                ],
                'categories' => [
                    [
                        'name' => 'Water Supply Interruption',
                        'name_ur' => 'پینے کے پانی کی فراہمی میں تعطل',
                    ],
                ],
            ],
            [
                'name' => 'Police & Public Safety',
                'name_ur' => 'محکمہ پولیس و امن عامہ',
                'code' => 'POL',
                'display_order' => 6,
                'sub_departments' => [
                    ['name' => 'Traffic Police', 'name_ur' => 'ٹریفک پولیس'],
                    ['name' => 'Investigation & Police Stations', 'name_ur' => 'تفتیش و تھانہ جات'],
                ],
                'categories' => [
                    [
                        'name' => 'FIR Registration Delay',
                        'name_ur' => 'ایف آئی آر درج کرنے میں تاخیر',
                    ],
                    [
                        'name' => 'Public Nuisance & Safety',
                        'name_ur' => 'عوامی پریشانی و امن عامہ کے مسائل',
                    ],
                ],
            ],
        ];

        foreach ($departmentsData as $deptData) {
            $department = Department::updateOrCreate(
                ['code' => $deptData['code']],
                [
                    'name' => $deptData['name'],
                    'name_ur' => $deptData['name_ur'],
                    'display_order' => $deptData['display_order'],
                    'is_active' => true,
                ]
            );

            if (isset($deptData['sub_departments'])) {
                foreach ($deptData['sub_departments'] as $subDept) {
                    SubDepartment::updateOrCreate(
                        [
                            'department_id' => $department->id,
                            'name' => $subDept['name'],
                        ],
                        [
                            'name_ur' => $subDept['name_ur'],
                            'is_active' => true,
                        ]
                    );
                }
            }

            if (isset($deptData['categories'])) {
                foreach ($deptData['categories'] as $catData) {
                    $category = Category::updateOrCreate(
                        [
                            'department_id' => $department->id,
                            'parent_category_id' => null,
                            'name' => $catData['name'],
                        ],
                        [
                            'name_ur' => $catData['name_ur'],
                            'is_active' => true,
                        ]
                    );

                    if (isset($catData['sub_categories'])) {
                        foreach ($catData['sub_categories'] as $subCat) {
                            Category::updateOrCreate(
                                [
                                    'department_id' => $department->id,
                                    'parent_category_id' => $category->id,
                                    'name' => $subCat['name'],
                                ],
                                [
                                    'name_ur' => $subCat['name_ur'],
                                    'is_active' => true,
                                ]
                            );
                        }
                    }
                }
            }
        }
    }
}
