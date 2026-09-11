/**
 * Context-aware Subject Suggestions based on selected Department and Category.
 * Each entry is [English Subject, Urdu Subject].
 */

// Fallback suggestions when no department is selected
export const GLOBAL_SUBJECT_SUGGESTIONS = [
    ['No electricity supply in the area', 'علاقے میں بجلی کی فراہمی بند ہے'],
    ['Overbilling on electricity bill', 'بجلی کے بل میں زائد رقم'],
    ['Street lights not working in street / locality', 'محلے میں اسٹریٹ لائٹس خراب ہیں'],
    ['Teacher absent from government school', 'سرکاری اسکول سے استاد غیر حاضر ہے'],
    ['School building in dangerous / unsafe condition', 'اسکول کی عمارت خطرناک اور غیر محفوظ ہے'],
    ['Hospital medicines unavailable for patients', 'اسپتال میں مریضوں کے لیے ادویات دستیاب نہیں'],
    ['Doctor or medical staff absent on duty', 'ڈیوٹی پر ڈاکٹر یا طبی عملہ غیر حاضر ہے'],
    ['Road damaged after landslide / rain', 'لینڈ سلائیڈنگ یا بارش سے سڑک ٹوٹ پھوٹ کا شکار'],
    ['Sewerage blockage and overflow in street', 'گلی میں گٹر بند اور گندا پانی جمع'],
    ['Garbage not collected from open plot / street', 'گلی یا خالی پلاٹ سے کچرا نہیں اٹھایا جا رہا'],
    ['Water supply line broken / contaminated water', 'پانی کی پائپ لائن ٹوٹی ہوئی ہے یا گندا پانی آرہا ہے'],
    ['FIR not registered by police station', 'تھانے میں ایف آئی آر درج نہیں کی جا رہی']
];

// Suggestions organized by Department Code and optionally Category Name keywords
export const DEPARTMENT_SUBJECT_MAP = {
    // 1. Home Department / Police
    HOME: {
        default: [
            ['FIR not registered by local police station', 'متعلقہ تھانے میں ایف آئی آر درج نہیں کی جا رہی'],
            ['Delay and inaction in police investigation', 'پولیس تفتیش میں غیر ضروری تاخیر اور سستی'],
            ['Police high-handedness and harassment', 'پولیس کی زیادتیاں اور بلاوجہ ہراساں کرنا'],
            ['Demand for illegal gratification / bribe by police', 'پولیس اہلکار کی جانب سے رشوت کا ناجائز مطالبہ'],
            ['Unjust traffic challan issued', 'بلاوجہ یا غلط ٹریفک چالان کا اجرا'],
            ['Delay in driving license issuance or renewal', 'ڈرائیونگ لائسنس کے اجرا یا تجدید میں تاخیر'],
            ['Delay in character certificate from Khidmat Markaz', 'خدمت مرکز سے کریکٹر سرٹیفکیٹ ملنے میں تاخیر'],
            ['Loss report entry not being entertained', 'گمشدگی رپورٹ کا اندراج نہیں کیا جا رہا']
        ],
        categories: {
            'Investigation': [
                ['FIR not registered by police station', 'تھانے میں ایف آئی آر کا اندراج نہیں ہو رہا'],
                ['Faulty and biased investigation by police officer', 'تفتیشی افسر کی جانب سے ناقص اور جانبدارانہ تفتیش'],
                ['Unnecessary delay in investigation proceedings', 'تفتیشی کارروائی میں غیر ضروری تاخیر'],
                ['Cancellation of false and fabricated FIR', 'جھوٹی اور بے بنیاد ایف آئی آر کی منسوخی'],
                ['Application for change of investigation officer', 'تفتیشی افسر تبدیل کرنے کی درخواست']
            ],
            'Non-registration of FIR': [
                ['Police refused to register FIR on cognizable offense', 'قابل دست اندازی جرم پر تھانے نے ایف آئی آر درج کرنے سے انکار کیا'],
                ['Application submitted but FIR not lodged', 'درخواست جمع کروانے کے باوجود ایف آئی آر درج نہیں کی گئی']
            ],
            'Faulty Investigation': [
                ['Investigating officer favoring the accused party', 'تفتیشی افسر ملزم فریق کی ناجائز حمایت کر رہا ہے'],
                ['Evidence ignored during police investigation', 'پولیس تفتیش کے دوران شواہد کو نظر انداز کیا گیا']
            ],
            'Delay in Investigation': [
                ['Challan not submitted to court after months', 'کئی ماہ گزرنے کے باوجود چالان عدالت میں پیش نہیں ہوا'],
                ['Investigation officer not pursuing the case', 'تفتیشی افسر کیس میں کوئی پیش رفت نہیں کر رہا']
            ],
            'Cancellation of False FIR': [
                ['False FIR registered due to personal enmity', 'ذاتی دشمنی کی بنا پر جھوٹی ایف آئی آر درج کرائی گئی'],
                ['Request to quash baseless police case', 'بے بنیاد مقدمہ خارج کرنے کی درخواست']
            ],
            'Change of Investigation Officer': [
                ['Lack of confidence in current investigating officer', 'موجودہ تفتیشی افسر پر عدم اعتماد'],
                ['Investigation officer biased towards opposite party', 'تفتیشی افسر دوسری پارٹی سے ملا ہوا ہے']
            ],
            'Police Corruption': [
                ['Demand for bribe by police official', 'پولیس اہلکار کی جانب سے رشوت طلب کی گئی'],
                ['Extortion of money under threat of arrest', 'گرفتاری کی دھمکی دے کر پیسے بٹورنے کی کوشش']
            ],
            'Police High-Handedness': [
                ['Illegal detention at police station', 'تھانے میں غیر قانونی حراست'],
                ['Physical assault and abusive language by police', 'پولیس اہلکاروں کی بدتمیزی اور تشدد'],
                ['Raid on private residence without warrant', 'بغیر وارنٹ گھر پر چھاپہ مارا گیا']
            ],
            'Complaint against Police': [
                ['Misconduct and abuse of power by police staff', 'پولیس اہلکاروں کا اختیارات کا ناجائز استعمال'],
                ['Refusal to provide citizen assistance at checkpost', 'چیک پوسٹ پر شہریوں کے ساتھ ناروا سلوک']
            ],
            'Traffic': [
                ['Unjustified traffic challan issued', 'بلاوجہ یا غلط ٹریفک چالان'],
                ['Severe traffic congestion due to lack of wardens', 'ٹریفک اہلکار نہ ہونے کی وجہ سے شدید ٹریفک جام'],
                ['Rude behavior by traffic police personnel', 'ٹریفک پولیس اہلکار کی بدکلامی اور بدتمیزی']
            ],
            'Traffic Challan Issue': [
                ['Challan issued without valid violation', 'بغیر کسی خلاف ورزی کے چالان کاٹ دیا گیا'],
                ['Wrong vehicle number entered on online challan', 'آن لائن چالان میں غلط گاڑی کا نمبر درج کر دیا گیا']
            ],
            'Driving License Issue': [
                ['Undue delay in printing driving license', 'ڈرائیونگ لائسنس کی پرنٹنگ اور ترسیل میں غیر ضروری تاخیر'],
                ['License test scheduling problem', 'لائسنس ٹیسٹ کے شیڈول میں دشواری']
            ],
            'Traffic Congestion': [
                ['Daily traffic jam at main intersection', 'مرکزی چوک پر روزانہ گھنٹوں ٹریفک جام'],
                ['Illegal parking blocking public highway', 'شاہراہ پر غیر قانونی پارکنگ سے راستہ بند']
            ],
            'Traffic Police Staff Behaviour': [
                ['Misconduct by traffic warden during vehicle stop', 'گاڑی روکنے پر ٹریفک وارڈن کی بدتمیزی'],
                ['Harassment by traffic staff on highway', 'شاہراہ پر ٹریفک عملے کی طرف سے ہراساں کرنا']
            ],
            'Police Services': [
                ['Delay in issuance of character certificate', 'کریکٹر سرٹیفکیٹ کے اجرا میں تاخیر'],
                ['Issues at Police Khidmat Markaz counter', 'پولیس خدمت مرکز کے کاؤنٹر پر دشواری'],
                ['Loss report entry refused by desk officer', 'ڈیسک افسر نے گمشدگی رپورٹ درج کرنے سے انکار کیا']
            ],
            'Character Certificate': [
                ['Character certificate not delivered within stipulated time', 'مقررہ وقت گزرنے کے باوجود کریکٹر سرٹیفکیٹ نہ ملا'],
                ['Police verification pending for overseas employment', 'بیرون ملک ملازمت کے لیے پولیس تصدیق رکی ہوئی ہے']
            ],
            'Loss Report Entry': [
                ['Refusal to enter loss report for CNIC / documents', 'شناختی کارڈ یا دستاویزات کی گمشدگی رپورٹ درج نہیں ہو رہی']
            ],
            'Khidmat Markaz Service': [
                ['Khidmat Markaz staff absent or uncooperative', 'خدمت مرکز پر عملہ غیر حاضر یا غیر تعاون یافتہ ہے'],
                ['Online system down at Police Khidmat Markaz', 'پولیس خدمت مرکز کا آن لائن سسٹم بند ہے']
            ],
            'Departmental Issue (Police Officials)': [
                ['Delay in GP fund or pension processing for police personnel', 'پولیس اہلکار کے جی پی فنڈ یا پنشن میں تاخیر'],
                ['Delay in Shaheed package release for family', 'شہید کے خاندان کے پیکج کے اجرا میں تاخیر']
            ]
        }
    },

    // 2. Health Department
    HLT: {
        default: [
            ['Shortage of essential life-saving medicines in hospital', 'اسپتال میں جان بچانے والی ضروری ادویات کی شدید قلت'],
            ['Absenteeism of doctors and specialists during duty hours', 'ڈیوٹی کے اوقات میں ڈاکٹرز اور ماہرین کی غیر حاضری'],
            ['Diagnostic machines / ultrasound / X-ray out of order', 'تشخیصی مشینیں، الٹراساؤنڈ یا ایکسرے خراب ہیں'],
            ['Unhygienic conditions and poor cleanliness in hospital wards', 'اسپتال کے وارڈز میں گندگی اور صفائی کے ناقص انتظامات'],
            ['Delay in emergency treatment of critical patient', 'ایمرجنسی میں شدید بیمار مریض کے علاج میں تاخیر'],
            ['Overcharging for free medicines or tests at DHQ / THQ', 'سرکاری اسپتال میں مفت ادویات یا ٹیسٹوں کے پیسے وصول کرنا']
        ],
        categories: {
            'Medicine Shortage': [
                ['Free government medicines not available in hospital pharmacy', 'اسپتال کی فارمیسی سے سرکاری مفت ادویات نہیں مل رہیں'],
                ['Patients forced to buy medicines from private medical stores', 'مریضوں کو باہر میڈیکل اسٹور سے مہنگی دوائیں خریدنے پر مجبور کیا جا رہا ہے'],
                ['Shortage of anti-rabies / snake venom vaccines', 'کتے یا سانپ کے کاٹنے کی ویکسین دستیاب نہیں ہے']
            ],
            'Facility Issues': [
                ['Hospital building washrooms broken and dirty', 'اسپتال کے واش رومز ٹوٹے اور گندے ہیں'],
                ['Lack of drinking water for patients and attendants', 'مریضوں اور لواحقین کے لیے پینے کا صاف پانی موجود نہیں'],
                ['Electricity backup / generator non-functional during power cuts', 'بجلی بندش کے دوران اسپتال کا جنریٹر نہیں چلایا جاتا']
            ],
            'Cleanliness': [
                ['Wards and emergency corridors filthy and uncleaned', 'ایمرجنسی اور وارڈز کے گلیاروں میں کچرا اور گندگی'],
                ['Hospital biohazard waste disposed in open area', 'طبی فضلہ کھلے عام پھینکا جا رہا ہے']
            ],
            'Equipment Not Functional': [
                ['X-Ray / Ultrasound machine out of order for weeks', 'ہفتوں سے ایکسرے یا الٹراساؤنڈ مشین خراب پڑی ہے'],
                ['Operation theater equipment non-functional', 'آپریشن تھیٹر کے آلات غیر فعال ہیں'],
                ['ECG machine not working in emergency room', 'ایمرجنسی روم میں ای سی جی مشین کام نہیں کر رہی']
            ],
            'Staff Behaviour': [
                ['Rude and aggressive behavior by nursing staff', 'نرسنگ عملے کا مریضوں اور تیمارداروں کے ساتھ توہین آمیز رویہ'],
                ['Security guards misbehaving with attendants', 'سیکیورٹی گارڈز کی تیمارداروں سے بدتمیزی']
            ],
            'Doctor Behaviour': [
                ['Doctor misbehaved and refused to examine patient', 'ڈاکٹر نے بدتمیزی کی اور مریض کا معائنہ کرنے سے انکار کیا'],
                ['Senior doctor referring patients to private clinic', 'سرکاری ڈاکٹر اپنے پرائیویٹ کلینک پر آنے کے لیے کہہ رہا ہے']
            ],
            'Nursing / Paramedic Staff Behaviour': [
                ['Paramedic staff negligent in administering medication', 'پیرامیڈیکل عملہ وقت پر دوائی اور ڈرپ لگانے میں غفلت برت رہا ہے'],
                ['Refusal of emergency drip / dressing by staff', 'عملے نے مرہم پٹی یا ڈرپ لگانے سے انکار کیا']
            ],
            'Staff Absenteeism': [
                ['Medical Officer absent from Rural Health Center (RHC)', 'دیہی ہیلتھ سینٹر سے میڈیکل آفیسر غیر حاضر ہے'],
                ['No doctor present during night emergency shift', 'رات کی شفٹ میں ایمرجنسی میں کوئی ڈاکٹر موجود نہیں'],
                ['Lady Health Worker (LHW) not visiting the area', 'لیڈی ہیلتھ ورکر علاقے کا دورہ نہیں کر رہی']
            ],
            'Delay in Treatment': [
                ['Emergency patient left unattended for hours', 'ایمرجنسی میں مریض کو گھنٹوں بغیر توجہ کے چھوڑ دیا گیا'],
                ['Long surgical operation dates given for urgent procedures', 'فوری آپریشن کے لیے کئی ماہ بعد کی لمبی تاریخ دی گئی']
            ],
            'Emergency Response': [
                ['Government ambulance refused or unavailable in emergency', 'ہنگامی حالت میں سرکاری ایمبولینس دستیاب نہیں یا انکار کیا گیا'],
                ['No oxygen cylinder available in emergency room', 'ایمرجنسی میں آکسیجن سلنڈر میسر نہیں تھا']
            ],
            'Overcharging': [
                ['Illegal fee charged for ultrasound / lab tests', 'الٹراساؤنڈ اور لیب ٹیسٹوں کے لیے غیر قانونی فیس لی گئی'],
                ['Slip counter staff charging above official rate', 'پرچی کاؤنٹر پر سرکاری ریٹ سے زیادہ پیسے لیے جا رہے ہیں']
            ]
        }
    },

    // 3. School Education Department
    SED: {
        default: [
            ['Teacher absent from school regularly', 'استاد باقاعدگی سے اسکول سے غیر حاضر رہتا ہے'],
            ['School building unsafe and risk of collapse', 'اسکول کی عمارت خستہ حال اور گرنے کا خطرہ ہے'],
            ['Lack of clean drinking water and toilets in school', 'اسکول میں پینے کے صاف پانی اور واش رومز کی عدم موجودگی'],
            ['Shortage of teaching staff in primary / high school', 'پرائمری یا ہائی اسکول میں اساتذہ کی شدید کمی'],
            ['Textbooks not delivered to enrolled students', 'طلباء کو سرکاری نصابی کتب فراہم نہیں کی گئیں'],
            ['Corporal punishment / harsh treatment of students', 'طلباء کو جسمانی سزا دینا اور ناروا سلوک'],
            ['School boundary wall broken / missing', 'اسکول کی چاردیواری ٹوٹی ہوئی ہے یا موجود نہیں']
        ],
        categories: {
            'Teacher Recruitment Process': [
                ['Irregularity in teacher appointment test / interview', 'اساتذہ کی بھرتی ٹیسٹ یا انٹرویو میں بے ضابطگی'],
                ['Delay in issuance of appointment letters for selected teachers', 'کامیاب اساتذہ کے تقرری ناموں کے اجرا میں تاخیر']
            ],
            'Insufficient Teachers': [
                ['Science / Math teacher post vacant for over a year', 'سائنس اور ریاضی کے استاد کی اسامی ایک سال سے خالی ہے'],
                ['Single teacher handling multiple grades in primary school', 'پرائمری اسکول میں ایک ہی استاد تمام کلاسز پڑھا رہا ہے']
            ],
            'New School Required': [
                ['Need for primary / middle school in remote village', 'دور دراز گاؤں میں پرائمری یا مڈل اسکول کا قیام درکار ہے'],
                ['Girls middle school required to prevent dropouts', 'بچیوں کی تعلیم کے لیے مڈل اسکول کی اشد ضرورت ہے']
            ],
            'School Timing': [
                ['School opening late and closing before designated time', 'اسکول مقررہ وقت کے بعد کھلتا ہے اور جلدی بند ہو جاتا ہے'],
                ['Extreme weather timings not implemented', 'موسمی شدت کے احکامات کے مطابق اسکول کے اوقات نافذ نہیں']
            ],
            'Text Books Not Received': [
                ['Free textbooks not provided despite start of academic term', 'تعلیمی سال شروع ہونے کے باوجود مفت نصابی کتب نہ مل سکیں'],
                ['Shortage of English and Science textbooks for 9th/10th', 'نویں اور دسویں جماعت کے لیے سائنس کی کتابیں میسر نہیں']
            ],
            'Dangerous Building': [
                ['Roof of classroom leaking and crumbling during rain', 'بارش کے دوران کلاس روم کی چھت ٹپک رہی ہے اور پلستر گر رہا ہے'],
                ['Cracked classroom walls posing threat to students life', 'کلاس روم کی دیواروں میں شگاف، طلباء کی جان کو خطرہ']
            ],
            'Drinking Water': [
                ['No drinking water facility for school children', 'اسکول کے بچوں کے لیے پینے کا صاف پانی میسر نہیں'],
                ['Contaminated water pipeline supplying water to school', 'اسکول کے واٹر ٹینک میں گندا پانی آ رہا ہے']
            ],
            'Electricity': [
                ['No electricity connection in school classrooms', 'اسکول کے کمروں میں بجلی کا کنکشن نہیں ہے'],
                ['School power meter disconnected due to pending bill', 'واجبات کی وجہ سے اسکول کا بجلی کا میٹر کٹ چکا ہے']
            ],
            'Boundary Wall': [
                ['No boundary wall leaving girls school insecure', 'چاردیواری نہ ہونے سے اسکول کا احاطہ غیر محفوظ ہے'],
                ['Boundary wall collapsed in heavy rain', 'شدید بارش سے اسکول کی چاردیواری گر گئی']
            ],
            'Furniture': [
                ['Students forced to sit on cold damp floor without desks', 'فرنیچر نہ ہونے سے بچے سرد زمین پر بیٹھنے پر مجبور'],
                ['Broken desks and chairs injuring school children', 'ٹوٹی ہوئی بینچوں سے بچوں کو چوٹ لگنے کا اندیشہ']
            ],
            'Classrooms': [
                ['Insufficient classrooms, children studying under open sky', 'کمروں کی کمی کی وجہ سے بچے کھلے آسمان تلے پڑھتے ہیں'],
                ['Overcrowded classrooms with more than 80 students', 'کلاس روم میں بچوں کی گنجائش سے بہت زیادہ تعداد']
            ],
            'Facilities': [
                ['Toilets completely non-functional or lacking water', 'اسکول کے بیت الخلا بالکل ناکارہ ہیں یا پانی نہیں'],
                ['No sanitation facilities in girls school', 'طالبات کے اسکول میں واش روم کی مناسب سہولت نہیں']
            ],
            'Punctuality': [
                ['Headmaster and teachers arriving very late daily', 'ہیڈ ماسٹر اور اساتذہ روزانہ تاخیر سے آتے ہیں'],
                ['Teachers absent on alternate days without approved leave', 'اساتذہ بغیر چھٹی کے باری باری غیر حاضر رہتے ہیں']
            ],
            'Corporal Punishment': [
                ['Teacher severely beat student causing injury', 'استاد نے طالبعلم پر وحشیانہ تشدد کیا'],
                ['Verbal abuse and humiliation of school pupils', 'اسکول میں بچوں کو توہین آمیز القابات اور دھمکیاں دینا']
            ],
            'Teacher Behaviour': [
                ['Rude conduct and neglect of teaching duties', 'استاد کا تدریسی فرائض سے غفلت اور بدتمیزی'],
                ['Private tuition forced upon students by government teacher', 'سرکاری استاد کا بچوں پر اپنے پاس ٹیوشن پڑھنے کے لیے دباؤ']
            ],
            'Teacher Transfers': [
                ['Political transfer leaving school without key subject teacher', 'سیاسی بنیادوں پر تبادلے سے اسکول استاد سے محروم ہوگیا'],
                ['Transfer order issued against ban', 'پابندی کے باوجود تبادلے کا آرڈر جاری کیا گیا']
            ],
            'Stipend': [
                ['Girls scholarship stipend not disbursed for two quarters', 'طالبات کا تعلیمی وظیفہ دو سہ ماہی سے ادا نہیں کیا گیا'],
                ['Deduction made by agent from student scholarship fund', 'طالبات کے وظیفے میں سے کٹوتی کی جا رہی ہے']
            ]
        }
    },

    // 4. Power Development Organization (Electricity)
    PDO: {
        default: [
            ['Prolonged unscheduled load-shedding for hours', 'گھنٹوں طویل غیراعلانیہ لوڈشیڈنگ'],
            ['Overbilling and inflated electricity units in monthly bill', 'بجلی کے ماہانہ بل میں اضافی یونٹ اور اووربلنگ'],
            ['Faulty or damaged transformer not repaired / replaced', 'خراب ٹرانسفارمر کی مرمت یا تبدیلی نہیں کی جا رہی'],
            ['Broken high-voltage wire hanging dangerously on street', 'گلی میں بجلی کی خطرناک ننگی تار لٹک رہی ہے'],
            ['Low voltage and severe fluctuation damaging home appliances', 'کم وولٹیج اور اتار چڑھاؤ سے گھریلو برقی اشیاء جلنے کا خطرہ'],
            ['Delay in installation of new electricity meter', 'نئے بجلی کے میٹر کی تنصیب میں بلاوجہ تاخیر']
        ],
        categories: {
            'Billing': [
                ['Excessive units billed compared to actual meter reading', 'اصل میٹر ریڈنگ سے کہیں زیادہ یونٹ ڈال کر بل بھیجا گیا'],
                ['Electricity bill received after payment due date', 'بل آخری تاریخ گزرنے کے بعد موصول ہوا'],
                ['Arrears added to electricity bill without justification', 'بغیر کسی وجہ کے بل میں پرانے بقایاجات شامل کر دیے گئے']
            ],
            'Overbilling': [
                ['Inflated meter reading resulting in heavy tariff slab', 'غلط ریڈنگ سے ہائیر سلیب کا اووربلنگ بل جاری ہوا'],
                ['Electricity meter running fast / defective meter', 'میٹر تیز چل رہا ہے یا خراب ہے']
            ],
            'Meter Reading Issue': [
                ['Meter reader not visiting site, reading entered on estimation', 'میٹر ریڈر موقع پر نہیں آتا، فرضی ریڈنگ درج کی جاتی ہے'],
                ['Photo reading not matching meter display', 'بل پر لگی تصویر اصل میٹر سے میل نہیں کھاتی']
            ],
            'Supply': [
                ['Power outage in entire village for over 48 hours', 'پورے گاؤں میں دو دن سے بجلی غائب ہے'],
                ['Frequent tripping on power feeder throughout the night', 'رات بھر فیڈر بار بار ٹرپ ہونے سے شدید پریشانی'],
                ['Phase missing / low single-phase power supply', 'بجلی کا ایک فیز غائب ہے یا وولٹیج کم ہیں']
            ],
            'Load-shedding Beyond Schedule': [
                ['Load-shedding carried out for 14+ hours against 4-hour schedule', 'شیڈول سے ہٹ کر چودہ گھنٹے سے زیادہ لوڈشیڈنگ'],
                ['Unannounced power shutdown during school and office hours', 'بغیر پیشگی اطلاع کے دفاتر اور اسکول کے اوقات میں بجلی بند']
            ],
            'No Power Supply': [
                ['Power cut off without notice or default', 'بغیر کسی نوٹس یا بل کے ڈیفالٹ کے بجلی کاٹ دی گئی'],
                ['Area left in darkness after small rainfall', 'معمولی بارش کے بعد پورا علاقہ اندھیرے میں ڈوب گیا']
            ],
            'Voltage Fluctuation': [
                ['Voltage drops below 140V, refrigerator and motor not working', 'وولٹیج 140 سے نیچے گر گئے، موٹر اور فریج کام نہیں کر رہے'],
                ['Sudden high voltage surge burned household electronics', 'اچانک تیز وولٹیج آنے سے گھریلو برقی سامان جل گیا']
            ],
            'New Connection': [
                ['Demand notice paid 3 months ago but meter not installed', 'ڈیمانڈ نوٹس ادا کیے تین ماہ گزر گئے مگر میٹر نہیں لگا'],
                ['Delay in approval of commercial / residential electricity connection', 'بجلی کے نئے کنکشن کی منظوری میں دفاتر کے چکر لگوائے جا رہے ہیں']
            ],
            'Delay in New Connection': [
                ['File pending with SDO office for new power connection', 'ایس ڈی او دفتر میں نئے کنکشن کی فائل غیر معینہ مدت سے زیر التوا ہے']
            ],
            'Infrastructure': [
                ['Damaged wooden or cement electricity pole on verge of falling', 'بجلی کا خستہ حال کھمبا کسی بھی وقت گرنے والا ہے'],
                ['Exposed live wires touching tree branches along public road', 'سڑک کنارے لٹکتی ننگی تاریں درختوں کو چھو رہی ہیں'],
                ['Transformer leaking oil / sparking constantly', 'ٹرانسفارمر سے تیل بہہ رہا ہے اور مسلسل چنگاریاں نکل رہی ہیں']
            ],
            'Damaged Pole / Wire': [
                ['Broken power pole blocking residential street', 'ٹوٹا ہوا کھمبا گلی کے بیچوں بیچ گرا ہوا ہے'],
                ['Low hanging electric wires posing hazard to pedestrians', 'پیدل چلنے والوں کے سر کے قریب لٹکتی خطرناک تاریں']
            ],
            'Transformer Fault': [
                ['Transformer burnt and no replacement provided for days', 'ٹرانسفارمر جل گیا، کئی دنوں سے کوئی دوسرا ٹرانسفارمر نہیں لگا'],
                ['Overloaded transformer tripping every half hour', 'اوورلوڈ ٹرانسفارمر ہر آدھے گھنٹے بعد ٹرپ ہو رہا ہے']
            ]
        }
    },

    // 5. Local Government & Rural Development Department
    LGRDD: {
        default: [
            ['Sewerage line choked and dirty wastewater overflowing onto road', 'سیوریج لائن بند، گندہ پانی سڑک اور گلیوں میں جمع'],
            ['Open and broken manholes endangering lives of pedestrians', 'کھلے اور ٹوٹے مین ہول، شہریوں کی جان کو شدید خطرہ'],
            ['Garbage piles accumulated and not collected by municipal staff', 'کچرے کے ڈھیر لگے ہیں اور میونسپل عملہ کچرا نہیں اٹھا رہا'],
            ['Street lights non-functional throughout neighborhood', 'محلے کی تمام اسٹریٹ لائٹس کئی ماہ سے خراب ہیں'],
            ['Public water supply scheme broken or contaminated water supplied', 'پبلک واٹر سپلائی اسکیم خراب ہے یا گندا پانی دیا جا رہا ہے'],
            ['Delay in issuance of Birth, Death, or Marriage Certificate', 'پیدائش، وفات یا نکاح سرٹیفکیٹ کے اجرا میں تاخیر'],
            ['Encroachments on public streets blocking vehicular traffic', 'عوامی راستوں اور گلیوں پر غیر قانونی تجاوزات']
        ],
        categories: {
            'Sanitation Services': [
                ['Sewer line blocked causing foul smell and health hazard', 'گٹر بند ہونے سے بدبو اور بیماریاں پھیلنے کا خدشہ'],
                ['Sanitation staff demanding illegal gratification to clean drains', 'نالیاں صاف کرنے کے لیے خاکروب ناجائز پیسوں کا مطالبہ کر رہے ہیں']
            ],
            'Sewerage Blockage': [
                ['Main drain choked, sewage entering houses during rain', 'مین نالہ بند، بارش میں گٹر کا گندا پانی گھروں میں داخل ہو رہا ہے'],
                ['Blocked sewerage line causing mosquito breeding and diseases', 'گٹر بند ہونے سے مچھر اور بیماریاں پیدا ہو رہی ہیں']
            ],
            'Sewerage Overflow': [
                ['Manhole overflowing on main bazaar walkway', 'مین بازار کے پیدل راستے پر گٹر کا پانی بہہ رہا ہے'],
                ['Filthy gutter water accumulated outside educational institute', 'اسکول اور کالج کے سامنے گندا پانی جمع ہے']
            ],
            'Open Manholes': [
                ['Missing manhole covers on busy pedestrian path', 'مصروف راستے پر گٹر کے ڈھکن غائب ہیں، حادثے کا خطرہ'],
                ['Broken manhole slab near school risking children life', 'اسکول کے قریب مین ہول کا ٹوٹا ہوا سلیب']
            ],
            'Solid Waste': [
                ['Dumping of waste in open plots without disposal', 'خالی پلاٹوں میں کچرا پھینکا جا رہا ہے، کوئی ٹھکانا نہیں'],
                ['Garbage collection container broken and overflowing', 'کچرا کنٹینر ٹوٹا ہوا اور کچرے سے ابل رہا ہے']
            ],
            'Garbage Not Collected': [
                ['Municipal garbage truck not visited neighborhood for two weeks', 'دو ہفتوں سے میونسپل کمیٹی کی کچرا گاڑی محلے میں نہیں آئی'],
                ['Sanitation workers absent from duty in sector', 'سیکٹر میں صفائی عملہ ڈیوٹی سے غیر حاضر ہے']
            ],
            'Heaps of Garbage in Open Plots': [
                ['Huge piles of trash attracting stray dogs and flies', 'کچرے کے ڈھیروں سے آوارہ کتوں اور مکھیوں کی بھرمار'],
                ['Stagnant heap of rotting waste spreading intolerable odor', 'کچرے کے سڑنے سے ناقابل برداشت بدبو']
            ],
            'Birth Certificate': [
                ['Birth certificate not issued despite submitting all verified docs', 'تمام مطلوبہ دستاویزات جمع کروانے کے باوجود پیدائش سرٹیفکیٹ نہ ملا'],
                ['Union Council secretary absent during public office hours', 'یونین کونسل سیکرٹری دفتر کے اوقات میں غائب رہتا ہے']
            ],
            'Non-issuance of Birth Certificate': [
                ['Delay of months in issuing computerized birth certificate', 'کمپیوٹرائزڈ پیدائش سرٹیفکیٹ جاری کرنے میں مہینوں کی تاخیر'],
                ['Illegal fee demanded for late birth entry', 'پیدائش کے اندراج کے لیے ناجائز فیس مانگی جا رہی ہے']
            ],
            'Correction in Record': [
                ['Typo in child or parent name on birth certificate not rectified', 'سرٹیفکیٹ پر بچے یا والدین کے نام کی غلطی درست نہیں کی جا رہی']
            ],
            'Death Certificate': [
                ['Undue delay in processing death certificate for estate settlement', 'جائیداد کی تقسیم کے لیے ڈیتھ سرٹیفکیٹ کے اجرا میں تاخیر'],
                ['Refusal by Secretary UC to issue death verification document', 'یونین کونسل سیکرٹری کا تصدیق جاری کرنے سے گریز']
            ],
            'Non-issuance of Death Certificate': [
                ['Death certificate not being issued despite hospital verification', 'اسپتال کی تصدیق کے باوجود وفات سرٹیفکیٹ جاری نہیں ہو رہا']
            ],
            'Marriage Certificate': [
                ['Nikahnama computerized certificate registration delayed', 'نکاح نامہ کمپیوٹرائزڈ رجسٹریشن میں تاخیر'],
                ['Excessive fee demanded for marriage certificate copy', 'نکاح سرٹیفکیٹ کی نقل کے لیے زیادہ فیس مانگی جا رہی ہے']
            ],
            'Street Lights': [
                ['Street lights out of order causing dark and dangerous streets', 'اسٹریٹ لائٹس بند ہونے سے رات کو وارداتوں کا خطرہ'],
                ['Street lights left ON during broad daylight wasting electricity', 'دن کے وقت اسٹریٹ لائٹس جلتی رہتی ہیں، بجلی کا ضیاع']
            ],
            'Not Functional': [
                ['Dark streets for past several months due to burnt bulbs', 'کئی ماہ سے بلب فیوز ہونے کی وجہ سے سڑکیں اندھیرے میں ہیں']
            ],
            'Provision Required': [
                ['Request for installation of solar or electric street lights', 'محلے کے موڑ اور چوک پر نئی اسٹریٹ لائٹس لگانے کی درخواست']
            ],
            'Water Supply': [
                ['Water supply scheme non-functional for past two months', 'پانی کی سپلائی اسکیم پچھلے دو ماہ سے مکمل بند ہے'],
                ['Dirty and contaminated tap water unfit for human consumption', 'نل سے گندا اور بدبودار پانی آ رہا ہے جو پینے کے قابل نہیں']
            ],
            'Non-Functional Water Supply Scheme': [
                ['Water supply tube well motor burnt and not repaired', 'ٹیوب ویل کی موٹر جل گئی، کئی ہفتوں سے مرمت نہیں ہوئی'],
                ['Water operator not releasing water on scheduled hours', 'واٹر سپلائی آپریٹر وقت پر پانی نہیں کھولتا']
            ],
            'Broken Pipes': [
                ['Main water supply pipe leaking, wasting thousands of gallons', 'پانی کی مین پائپ لائن پھٹ گئی، ہزاروں گیلن پانی ضائع ہو رہا ہے'],
                ['Broken water pipe submerged in open drain contaminating drinking supply', 'سیوریج کے نالے میں ٹوٹی پائپ لائن سے گندا پانی مکس ہو رہا ہے']
            ],
            'Encroachment': [
                ['Footpath occupied by shopkeepers forcing people onto road', 'دکانداروں نے فٹ پاتھ پر سامان رکھ کر راستہ بند کر دیا'],
                ['Permanent illegal structures constructed on public walkway', 'عوامی گزرگاہ پر پکی غیر قانونی تعمیرات']
            ],
            'Illegal Construction': [
                ['Unauthorized commercial building without municipal approval', 'میونسپل کمیٹی کی منظوری کے بغیر غیر قانونی کمرشل عمارت'],
                ['Construction violating setback rules and endangering neighbors', 'قواعد کی خلاف ورزی کرتے ہوئے خطرناک تعمیرات']
            ],
            'Building Plan Approval': [
                ['Residential building map approval delayed for months', 'رہائشی مکان کا نقشہ منظور کرنے میں غیر معینہ تاخیر'],
                ['Demand for bribe to pass building map', 'نقشہ پاس کرنے کے لیے رشوت کا مطالبہ']
            ]
        }
    },

    // 6. Communications & Works Department (C&W / Roads)
    CNW: {
        default: [
            ['Potholes and severely damaged road causing accidents', 'سڑک پر گہرے گڑھے اور ٹوٹ پھوٹ سے روزانہ حادثات'],
            ['Road blocked or cracked after landslide / heavy rainfall', 'لینڈ سلائیڈنگ یا شدید بارش سے سڑک بند یا دراڑیں'],
            ['Incomplete road project abandoned by contractor', 'ٹھیکیدار کا سڑک کا ادھورا کام چھوڑ کر غائب ہو جانا'],
            ['Bridge or culvert structurally cracked and dangerous', 'پل یا پلیا خستہ حال اور گرنے کے دہانے پر'],
            ['Lack of safety barriers / retaining walls on hilly roads', 'پہاڑی سڑک پر حفاظتی جنگلے یا حفاظتی دیوار نہ ہونا']
        ],
        categories: {
            'Service Delivery': [
                ['Delay in clearing landslide debris from main road', 'مرکزی سڑک سے لینڈ سلائیڈنگ کا ملبہ ہٹانے میں تاخیر'],
                ['Substandard asphalt and material used in road carpeting', 'سڑک کی مرمت میں انتہائی ناقص میٹریل کا استعمال']
            ],
            'System Improvement': [
                ['Need for widening and drainage culverts on hilly road', 'پہاڑی سڑک کو کشادہ کرنے اور نکاسی کے لیے پلیوں کی ضرورت'],
                ['Installation of warning signs and guard rails on sharp turns', 'خطرناک موڑ پر حفاظتی جنگلے اور انتباہی بورڈ نصب کیے جائیں']
            ]
        }
    },

    // 7. Information Technology Board (ITB)
    ITB: {
        default: [
            ['Online portal or mobile app technical error / crash', 'آن لائن پورٹل یا موبائل ایپ پر تکنیکی خرابی'],
            ['Online fee payment failed or deducted without confirmation', 'آن لائن فیس کٹ گئی مگر پورٹل پر رسید موصول نہیں ہوئی'],
            ['User account locked or password reset not working', 'اکاؤنٹ بلاک ہوگیا یا پاس ورڈ تبدیل کرنے کا لنک نہیں آ رہا'],
            ['Slow server response or system downtime on government website', 'سرکاری ویب سائٹ کا سرور ڈاؤن ہے یا بہت سست ہے']
        ],
        categories: {
            'App / Web Portal Issue': [
                ['Citizen portal showing error during complaint submission', 'پورٹل پر شکایت درج کرتے وقت سسٹم ایرر آ رہا ہے'],
                ['Mobile application crashing on login screen', 'موبائل ایپ لاگ ان اسکرین پر کریش ہو جاتی ہے']
            ],
            'Payment Not Received': [
                ['Challan fee deducted from bank account but status pending', 'بینک اکاؤنٹ سے فیس کٹ گئی لیکن اسٹیٹس پر پینڈنگ آ رہا ہے']
            ],
            'Account / Access Issue': [
                ['Unable to verify account via OTP SMS', 'او ٹی پی ایس ایم ایس موصول نہیں ہو رہا'],
                ['CNIC already registered error preventing citizen registration', 'شناختی کارڈ پہلے سے رجسٹرڈ ہونے کا ایرر آ رہا ہے']
            ]
        }
    },

    // 8. Food Authority
    FOOD: {
        default: [
            ['Sale of adulterated milk, oil, and food items in market', 'مارکیٹ میں ملاوٹ شدہ دودھ، تیل اور اشیائے خوردونوش کی فروخت'],
            ['Substandard and unhygienic conditions in restaurants / bakeries', 'ہوٹلوں اور بیکریوں میں ناقص صفائی اور باسی کھانا'],
            ['Sale of expired food products and baby milk in grocery stores', 'کریانہ اسٹورز پر ایکسپائرڈ اشیاء اور ڈبے کا دودھ فروخت ہونا'],
            ['Artificial price hike and overcharging above official price list', 'سرکاری نرخ نامے سے زائد قیمتیں اور گراں فروشی']
        ],
        categories: {
            'Service Delivery': [
                ['Food inspectors not conducting market inspections', 'فوڈ انسپکٹرز کی جانب سے بازاروں میں چیکنگ نہ ہونا'],
                ['Substandard meat being sold without veterinary stamp', 'بغیر مہر کے ناقص اور مضر صحت گوشت کی فروخت']
            ]
        }
    },

    // 9. Board of Revenue
    BOR: {
        default: [
            ['Patwari demanding illegal bribe for land record / Fard', 'پٹواری کی جانب سے فرد اراضی اور ریکارڈ کے لیے رشوت کا مطالبہ'],
            ['Unjustified delay in land mutation (Intiqal) processing', 'زمین کے انتقال اور رجسٹری کے عمل میں بلاوجہ تاخیر'],
            ['Tampering or discrepancy in land revenue record (Misal-e-Haqiat)', 'اراضی ریکارڈ یا مثل حقیقت میں گڑبڑ اور ردوبدل'],
            ['Illegal demarcation / measurement of land boundaries by revenue staff', 'ریونیو عملے کی جانب سے زمین کی غلط اور یکطرفہ پیمائش'],
            ['Delay in obtaining certified copies of revenue records', 'ریونیو ریکارڈ کی مصدقہ نقول فراہم کرنے میں لیت و لعل']
        ],
        categories: {
            'Service Delivery': [
                ['Patwari absent from Halqa office during public dealing hours', 'عوامی اوقات میں پٹواری کا اپنے حلقہ دفتر سے مسلسل غیر حاضر رہنا'],
                ['Refusal by Tehsildar office to verify property registry', 'تحصیلدار دفتر کا پراپرٹی رجسٹری کی تصدیق کرنے سے انکار']
            ]
        }
    },

    // 10. Higher Education Department (HED)
    HED: {
        default: [
            ['Shortage of lecturers / professors in postgraduate college', 'پوسٹ گریجویٹ کالج میں لیکچررز اور پروفیسروں کی کمی'],
            ['Delay in issuance of college degree or transcript', 'کالج ڈگری یا ٹرانسکرپٹ کے اجرا میں تاخیر'],
            ['Science laboratory equipment obsolete or missing in college', 'کالج میں سائنس لیب کے آلات کی کمی یا ناکارہ حالت'],
            ['College transport bus service non-functional for students', 'طلباء کے لیے کالج بس سروس بند ہے'],
            ['Hostel facility problems and unhygienic mess food', 'کالج ہاسٹل میں صفائی کے مسائل اور ناقص کھانا']
        ]
    },

    // 11. Agriculture Department
    AGR: {
        default: [
            ['Spurious / adulterated pesticides and fertilizers sold in market', 'مارکیٹ میں دو نمبر بیج اور جعلی کھاد کی فروخت'],
            ['Lack of advisory support from agriculture extension staff', 'محکمہ زراعت کے فیلڈ اسٹاف کی کسانوں کو رہنمائی نہ ملنا'],
            ['Damage to crops due to pests and no government spray assistance', 'فصلوں پر بیماری کا حملہ اور حکومتی سطح پر اسپرے کی عدم فراہمی']
        ]
    },

    // 12. Forest, Wildlife & Fisheries
    FWF: {
        default: [
            ['Illegal timber cutting and deforestation in forest compartment', 'جنگل میں لکڑی کی غیر قانونی کٹائی اور چوری'],
            ['Illegal hunting / poaching of protected wildlife and birds', 'نایاب جنگلی حیات اور پرندوں کا غیر قانونی شکار'],
            ['Forest fire not extinguished by local department teams', 'جنگل کی آگ بجھانے میں محکمہ جنگلات کی غفلت'],
            ['Illegal fishing using chemicals or electric current in river', 'دریا میں کرنٹ یا زہر ڈال کر مچھلیوں کا غیر قانونی شکار']
        ]
    },

    // 13. Transport Department
    TRN: {
        default: [
            ['Overcharging by public transport vans above official fare rates', 'پبلک ٹرانسپورٹ وینز کا سرکاری کرایہ نامے سے زیادہ وصولی کرنا'],
            ['Overcrowding and overloading in passenger vehicles', 'مسافر گاڑیوں میں گنجائش سے زائد مسافر بٹھانا'],
            ['Unfit and smoke-emitting public transport vehicles on route', 'دھواں چھوڑنے والی اور غیر معیاری گاڑیوں کا روٹ پر چلنا'],
            ['Refusal by drivers to operate on designated government route', 'ڈرائیوروں کا مقررہ روٹ کے بجائے شارٹ روٹ پر گاڑی چلانا']
        ]
    },

    // 14. Excise & Taxation Department
    ETD: {
        default: [
            ['Undue delay in vehicle registration card / smart card issuance', 'گاڑی کے اسمارٹ رجسٹریشن کارڈ کے اجرا میں طویل تاخیر'],
            ['Discrepancy in property tax assessment calculation', 'پراپرٹی ٹیکس کے اسیسمنٹ میں غیر منصفانہ اور غلط حساب'],
            ['Token tax paid online but record showing unpaid', 'آن لائن ٹوکن ٹیکس جمع کروایا مگر ریکارڈ پر غیر ادا شدہ آ رہا ہے']
        ]
    },

    // 15. Zakat & Ushr Department
    ZKT: {
        default: [
            ['Deserving needy applicants excluded from local Zakat committee list', 'مستحق اور نادار افراد کو زکوٰۃ کمیٹی کی لسٹ سے نکال دیا گیا'],
            ['Delay in Guzara Allowance disbursement to poor widows', 'بیواؤں اور غریبوں کے گزارہ الاؤنس کی ادائیگی میں تاخیر'],
            ['Political favoritism in Zakat fund distribution', 'زکوٰۃ فنڈ کی تقسیم میں پسند ناپسند اور اقربا پروری']
        ]
    },

    // 16. Services & General Administration (SGAD) / General Government
    SGAD: {
        default: [
            ['Government officers absent from duty during public visiting hours', 'عوامی ملاقات کے اوقات میں سرکاری افسران کا دفتر میں موجود نہ ہونا'],
            ['Inordinate delay in disposal of citizen applications in secretariat', 'سیکرٹریٹ میں عوامی درخواستوں پر مہینوں کوئی فیصلہ نہ ہونا'],
            ['Misconduct, bribery or harassment by government department staff', 'سرکاری اہلکاروں کی بدتمیزی، رشوت ستانی یا ہراساں کرنا'],
            ['Delay in pension, gratuity or retirement dues of retired employee', 'ریٹائرڈ ملازم کے پنشن، گریجویٹی اور واجبات کے اجرا میں تاخیر']
        ]
    }
};

/**
 * Returns tailored subject suggestions for the selected department and category.
 *
 * @param {Object|null} department - Selected department object (e.g. { id, code, name })
 * @param {Object|null} category - Selected category object (e.g. { id, name })
 * @param {string} filterText - Text typed into subject input
 * @returns {Array<[string, string]>} List of [English, Urdu] subject pairs
 */
export function getSubjectSuggestions(department, category, filterText = '') {
    let pool = [];

    if (department && department.code && DEPARTMENT_SUBJECT_MAP[department.code]) {
        const deptConfig = DEPARTMENT_SUBJECT_MAP[department.code];

        if (category && category.name && deptConfig.categories) {
            // Find exact or partial category match in the map
            const catKey = Object.keys(deptConfig.categories).find(k =>
                category.name.toLowerCase().includes(k.toLowerCase()) ||
                k.toLowerCase().includes(category.name.toLowerCase())
            );

            if (catKey && deptConfig.categories[catKey]?.length) {
                // Category-specific suggestions first, followed by department defaults
                const catSuggestions = deptConfig.categories[catKey];
                const deptDefaults = (deptConfig.default || []).filter(
                    d => !catSuggestions.some(c => c[0] === d[0])
                );
                pool = [...catSuggestions, ...deptDefaults];
            } else if (deptConfig.default?.length) {
                pool = deptConfig.default;
            }
        } else if (deptConfig.default?.length) {
            pool = deptConfig.default;
        }
    } else if (department && department.name) {
        // Match by department name keyword if code didn't match directly
        const name = department.name.toLowerCase();
        let matchedCode = null;
        if (name.includes('police') || name.includes('home')) matchedCode = 'HOME';
        else if (name.includes('health')) matchedCode = 'HLT';
        else if (name.includes('school') || name.includes('sed')) matchedCode = 'SED';
        else if (name.includes('power') || name.includes('electric') || name.includes('pdo')) matchedCode = 'PDO';
        else if (name.includes('local') || name.includes('lgrdd')) matchedCode = 'LGRDD';
        else if (name.includes('works') || name.includes('c&w') || name.includes('cnw')) matchedCode = 'CNW';
        else if (name.includes('technology') || name.includes('itb')) matchedCode = 'ITB';
        else if (name.includes('food')) matchedCode = 'FOOD';
        else if (name.includes('revenue')) matchedCode = 'BOR';
        else if (name.includes('higher education') || name.includes('hed')) matchedCode = 'HED';
        else if (name.includes('agriculture')) matchedCode = 'AGR';
        else if (name.includes('forest')) matchedCode = 'FWF';
        else if (name.includes('transport')) matchedCode = 'TRN';
        else if (name.includes('excise')) matchedCode = 'ETD';
        else if (name.includes('zakat')) matchedCode = 'ZKT';
        else if (name.includes('administration') || name.includes('services')) matchedCode = 'SGAD';

        if (matchedCode && DEPARTMENT_SUBJECT_MAP[matchedCode]) {
            const deptConfig = DEPARTMENT_SUBJECT_MAP[matchedCode];
            if (category && category.name && deptConfig.categories) {
                const catKey = Object.keys(deptConfig.categories).find(k =>
                    category.name.toLowerCase().includes(k.toLowerCase()) ||
                    k.toLowerCase().includes(category.name.toLowerCase())
                );
                if (catKey && deptConfig.categories[catKey]?.length) {
                    const catSuggestions = deptConfig.categories[catKey];
                    const deptDefaults = (deptConfig.default || []).filter(
                        d => !catSuggestions.some(c => c[0] === d[0])
                    );
                    pool = [...catSuggestions, ...deptDefaults];
                } else {
                    pool = deptConfig.default || [];
                }
            } else {
                pool = deptConfig.default || [];
            }
        }
    }

    // If still empty or no department, use global suggestions
    if (!pool.length) {
        pool = GLOBAL_SUBJECT_SUGGESTIONS;
    }

    // Filter by input query if provided
    if (filterText && filterText.trim()) {
        const q = filterText.trim().toLowerCase();
        return pool.filter(item =>
            item[0].toLowerCase().includes(q) ||
            item[1].includes(q)
        );
    }

    return pool;
}
