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
                    ['name' => 'Medicine Shortage', 'name_ur' => 'ادویات کی قلت', 'sub_categories' => [
                        ['name' => 'Life Saving Drugs', 'name_ur' => 'زندگی بچانے والی ادویات'],
                        ['name' => 'General Medicine', 'name_ur' => 'عام ادویات'],
                        ['name' => 'Vaccines & Immunization Stock', 'name_ur' => 'حفاظتی ٹیکوں کی عدم دستیابی'],
                    ]],
                    ['name' => 'Staff Absence & Misbehavior', 'name_ur' => 'عملے کی غیر حاضری و بدسلوکی', 'sub_categories' => [
                        ['name' => 'Doctor Absence', 'name_ur' => 'ڈاکٹر کی غیر حاضری'],
                        ['name' => 'Paramedical Staff Absence', 'name_ur' => 'پیرامیڈیکل عملے کی غیر حاضری'],
                        ['name' => 'Misbehavior with Patients', 'name_ur' => 'مریضوں کے ساتھ بدسلوکی'],
                    ]],
                    ['name' => 'Poor Hospital Hygiene & Sanitation', 'name_ur' => 'ہسپتال میں صفائی کا ناقص انتظام'],
                    ['name' => 'Non-Functional Medical Equipment', 'name_ur' => 'طبی آلات کا غیر فعال ہونا'],
                    ['name' => 'Ambulance Service Issues', 'name_ur' => 'ایمبولینس سروس کے مسائل', 'sub_categories' => [
                        ['name' => 'Ambulance Unavailability', 'name_ur' => 'ایمبولینس کی عدم دستیابی'],
                        ['name' => 'Delayed Response Time', 'name_ur' => 'تاخیر سے پہنچنا'],
                    ]],
                    ['name' => 'Overcharging / Illegal Fee Collection', 'name_ur' => 'ناجائز فیس کی وصولی'],
                    ['name' => 'Medical Negligence', 'name_ur' => 'طبی غفلت'],
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
                    ['name' => 'Teacher Shortage / Absence', 'name_ur' => 'اساتذہ کی قلت یا غیر حاضری', 'sub_categories' => [
                        ['name' => 'Teacher Absenteeism', 'name_ur' => 'اساتذہ کی غیر حاضری'],
                        ['name' => 'Vacant Teaching Posts', 'name_ur' => 'اساتذہ کی خالی اسامیاں'],
                    ]],
                    ['name' => 'Building & Infrastructure Defect', 'name_ur' => 'عمارت کی خستہ حالی و بنیادی سہولیات', 'sub_categories' => [
                        ['name' => 'Damaged Classrooms / Boundary Wall', 'name_ur' => 'خستہ حال کمرے یا چاردیواری'],
                        ['name' => 'Lack of Furniture', 'name_ur' => 'فرنیچر کی کمی'],
                    ]],
                    ['name' => 'Missing Basic Facilities', 'name_ur' => 'بنیادی سہولیات کا فقدان', 'sub_categories' => [
                        ['name' => 'No Drinking Water', 'name_ur' => 'پینے کے پانی کی عدم دستیابی'],
                        ['name' => 'No Washrooms / Toilets', 'name_ur' => 'بیت الخلاء کی عدم دستیابی'],
                        ['name' => 'No Electricity', 'name_ur' => 'بجلی کی عدم فراہمی'],
                    ]],
                    ['name' => 'Free Textbooks Non-Distribution', 'name_ur' => 'مفت نصابی کتب کی عدم تقسیم'],
                    ['name' => 'Corporal Punishment / Misconduct', 'name_ur' => 'جسمانی سزا یا بدتمیزی'],
                    ['name' => 'Unauthorized School Closure', 'name_ur' => 'سکول کی غیر مجاز بندش'],
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
                    ['name' => 'Unscheduled Load Shedding', 'name_ur' => 'بغیر شیڈول لوڈ شیڈنگ', 'sub_categories' => [
                        ['name' => 'Feeder-wise Unscheduled Outage', 'name_ur' => 'فیڈر کی سطح پر غیر شیڈول بندش'],
                        ['name' => 'Extended Outage Duration', 'name_ur' => 'بندش کا دورانیہ معمول سے زیادہ'],
                    ]],
                    ['name' => 'Transformer Fault / Overbilling', 'name_ur' => 'ٹرانسفارمر کی خرابی یا غلط بلنگ', 'sub_categories' => [
                        ['name' => 'Transformer Burnt / Damaged', 'name_ur' => 'ٹرانسفارمر جل جانا یا خراب ہونا'],
                        ['name' => 'Overbilling / Wrong Meter Reading', 'name_ur' => 'زائد بل یا غلط میٹر ریڈنگ'],
                    ]],
                    ['name' => 'New Connection Delay', 'name_ur' => 'نئے کنکشن میں تاخیر'],
                    ['name' => 'Voltage Fluctuation', 'name_ur' => 'وولٹیج میں کمی بیشی'],
                    ['name' => 'Illegal Connections / Electricity Theft', 'name_ur' => 'غیر قانونی کنکشن یا بجلی چوری'],
                    ['name' => 'Faulty / Broken Meter', 'name_ur' => 'خراب میٹر'],
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
                    ['name' => 'Fard Distribution Delay', 'name_ur' => 'فرد کے اجراء میں تاخیر'],
                    ['name' => 'Illegal Encroachment / Mutation Dispute', 'name_ur' => 'ناجائز قبضہ یا تنازعِ انتقال', 'sub_categories' => [
                        ['name' => 'Illegal Occupation of Land', 'name_ur' => 'اراضی پر ناجائز قبضہ'],
                        ['name' => 'Mutation (Intiqal) Dispute', 'name_ur' => 'انتقالِ اراضی کا تنازع'],
                    ]],
                    ['name' => 'Registration & Stamp Paper Delay', 'name_ur' => 'رجسٹری و اسٹامپ پیپر میں تاخیر'],
                    ['name' => 'Patwari Non-Cooperation / Bribery', 'name_ur' => 'پٹواری کی عدم تعاون یا رشوت طلبی'],
                    ['name' => 'Land Record Digitization Error', 'name_ur' => 'اراضی ریکارڈ کی ڈیجیٹائزیشن میں غلطی'],
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
                    ['name' => 'Water Supply Interruption', 'name_ur' => 'پینے کے پانی کی فراہمی میں تعطل', 'sub_categories' => [
                        ['name' => 'No Water Supply', 'name_ur' => 'پانی کی عدم فراہمی'],
                        ['name' => 'Contaminated / Unsafe Water', 'name_ur' => 'آلودہ یا غیر محفوظ پانی'],
                        ['name' => 'Low Water Pressure', 'name_ur' => 'پانی کا کم دباؤ'],
                    ]],
                    ['name' => 'Sewerage & Drainage Blockage', 'name_ur' => 'سیوریج و نکاسی آب کی بندش'],
                    ['name' => 'Illegal Construction', 'name_ur' => 'غیر قانونی تعمیرات'],
                    ['name' => 'Building Plan Approval Delay', 'name_ur' => 'نقشہ منظوری میں تاخیر'],
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
                    ['name' => 'FIR Registration Delay', 'name_ur' => 'ایف آئی آر درج کرنے میں تاخیر', 'sub_categories' => [
                        ['name' => 'Refusal to Register FIR', 'name_ur' => 'ایف آئی آر درج کرنے سے انکار'],
                        ['name' => 'Delay in FIR Registration', 'name_ur' => 'ایف آئی آر درج کرنے میں تاخیر'],
                    ]],
                    ['name' => 'Public Nuisance & Safety', 'name_ur' => 'عوامی پریشانی و امن عامہ کے مسائل', 'sub_categories' => [
                        ['name' => 'Noise Pollution', 'name_ur' => 'شور کی آلودگی'],
                        ['name' => 'Illegal Gambling / Drugs', 'name_ur' => 'غیر قانونی جوا یا منشیات'],
                    ]],
                    ['name' => 'Police Misconduct / Corruption', 'name_ur' => 'پولیس کی بدسلوکی یا بدعنوانی'],
                    ['name' => 'Traffic Violations & Congestion', 'name_ur' => 'ٹریفک کی خلاف ورزی و رش', 'sub_categories' => [
                        ['name' => 'Illegal Parking', 'name_ur' => 'غیر قانونی پارکنگ'],
                        ['name' => 'Traffic Signal Malfunction', 'name_ur' => 'ٹریفک سگنل کی خرابی'],
                    ]],
                    ['name' => 'Missing Person Case Delay', 'name_ur' => 'گمشدہ شخص کے کیس میں تاخیر'],
                    ['name' => 'Harassment Complaint', 'name_ur' => 'ہراسانی کی شکایت'],
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
