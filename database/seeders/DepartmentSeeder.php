<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Department;
use App\Models\SubDepartment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use ZipArchive;

class DepartmentSeeder extends Seeder
{
    /**
     * Standard department code mapping to preserve recognized abbreviations.
     */
    protected array $departmentCodes = [
        'Services & General Administration Department' => 'SGAD',
        'Home Department (incl. AJK Police)' => 'HOME',
        'Health Department' => 'HLT',
        'Higher Education Department (HED)' => 'HED',
        'School Education Department (SED)' => 'SED',
        'Local Government & Rural Development Department' => 'LGRDD',
        'Planning & Development Department' => 'PND',
        'Power Development Organization (Electricity)' => 'PDO',
        'Communications & Works Department (C&W)' => 'CNW',
        'Information Technology Board (ITB), AJK' => 'ITB',
        'Industries & Commerce Department' => 'IND',
        'Board of Investment, AJK' => 'BOI',
        'Small Industries Corporation' => 'SIC',
        'Food Authority' => 'FOOD',
        'Tourism & Archaeology Department' => 'TOUR',
        'Information Department (DGPR)' => 'DGPR',
        'Irrigation Department' => 'IRR',
        'Law, Justice, Parliamentary Affairs & Human Rights Department' => 'LAW',
        'Livestock & Dairy Development Department' => 'LDD',
        'Minerals Department' => 'MIN',
        'Physical Planning & Housing Department' => 'PPH',
        'Zakat & Ushr Department' => 'ZKT',
        'Forestry, Wildlife & Fisheries Department' => 'FWF',
        'Environment Protection Agency (EPA), AJK' => 'EPA',
        'Social Welfare & Bait-ul-Mal Department (SW&BM)' => 'SWBM',
        'Finance Department' => 'FIN',
        'Board of Revenue' => 'BOR',
        'Excise & Taxation Department' => 'ETD',
        'Agriculture Department' => 'AGR',
        'Auqaf, Hajj & Religious Affairs Department' => 'AUQ',
        'Labour Department' => 'LBR',
        'Youth Affairs & Sports Department' => 'YAS',
        'Transport Department' => 'TRN',
        'Population Welfare Department' => 'PWD',
    ];

    /**
     * Run the database seeds from docs/AJK-Departments-Categories.xlsx.
     */
    public function run(): void
    {
        $filePath = base_path('docs/AJK-Departments-Categories.xlsx');
        if (! file_exists($filePath)) {
            $filePath = base_path('AJK-Departments-Categories.xlsx');
        }

        if (! file_exists($filePath)) {
            throw new \RuntimeException("Departments and categories source file not found at: {$filePath}");
        }

        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            throw new \RuntimeException("Unable to open Excel archive at: {$filePath}");
        }

        Schema::disableForeignKeyConstraints();
        Category::truncate();
        SubDepartment::truncate();
        Department::truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Read Sheet 1: Departments
        $deptXml = simplexml_load_string($zip->getFromName('xl/worksheets/sheet1.xml'));
        $departmentMap = []; // name => Department model
        $rowIdx = 0;
        $order = 1;

        foreach ($deptXml->sheetData->row as $row) {
            $rowIdx++;
            if ($rowIdx === 1) {
                continue; // Skip header row
            }

            $cells = $this->parseRowCells($row);
            $deptName = trim($cells['A'] ?? '');
            $deptNameUr = trim($cells['B'] ?? '');

            if ($deptName === '') {
                continue;
            }

            $code = $this->departmentCodes[$deptName] ?? $this->generateCode($deptName);

            $department = Department::create([
                'name' => $deptName,
                'name_ur' => $deptNameUr ?: null,
                'code' => $code,
                'display_order' => $order++,
                'is_active' => true,
            ]);

            $departmentMap[$deptName] = $department;
        }

        // 2. Read Sheet 2: Hierarchy
        $hierXml = simplexml_load_string($zip->getFromName('xl/worksheets/sheet2.xml'));
        $groupedHierarchy = [];
        $rowIdx = 0;

        foreach ($hierXml->sheetData->row as $row) {
            $rowIdx++;
            if ($rowIdx === 1) {
                continue; // Skip header row
            }

            $cells = $this->parseRowCells($row);
            $deptName = trim($cells['A'] ?? '');
            $catName = trim($cells['B'] ?? '');
            $catNameUr = trim($cells['C'] ?? '');
            $subName = trim($cells['D'] ?? '');
            $subNameUr = trim($cells['E'] ?? '');

            if ($deptName === '' || $catName === '') {
                continue;
            }

            if (! isset($groupedHierarchy[$deptName])) {
                $groupedHierarchy[$deptName] = [];
            }

            if (! isset($groupedHierarchy[$deptName][$catName])) {
                $groupedHierarchy[$deptName][$catName] = [
                    'name' => $catName,
                    'name_ur' => $catNameUr,
                    'subs' => [],
                ];
            }

            if ($subName !== '') {
                $groupedHierarchy[$deptName][$catName]['subs'][$subName] = $subNameUr;
            }
        }

        // 3. Seed Categories per specifications
        foreach ($groupedHierarchy as $deptName => $categories) {
            $department = $departmentMap[$deptName] ?? Department::where('name', $deptName)->first();

            if (! $department) {
                continue;
            }

            foreach ($categories as $catName => $catData) {
                $subs = $catData['subs'];

                // Rule 1: If a Category's value is identical to its Sub Category (e.g. 'Others' / 'Others'),
                // create ONE category row with parent_category_id left empty (no duplicate child).
                if (count($subs) === 1 && isset($subs[$catName])) {
                    Category::create([
                        'department_id' => $department->id,
                        'parent_category_id' => null,
                        'name' => $catName,
                        'name_ur' => $catData['name_ur'] ?: null,
                        'is_active' => true,
                    ]);
                } else {
                    // Rule 2: If a Category has one or more different Sub Category values under it,
                    // create one parent category row, then one child category row for each distinct Sub Category value.
                    $parent = Category::create([
                        'department_id' => $department->id,
                        'parent_category_id' => null,
                        'name' => $catName,
                        'name_ur' => $catData['name_ur'] ?: null,
                        'is_active' => true,
                    ]);

                    foreach ($subs as $subName => $subNameUr) {
                        Category::create([
                            'department_id' => $department->id,
                            'parent_category_id' => $parent->id,
                            'name' => $subName,
                            'name_ur' => $subNameUr ?: null,
                            'is_active' => true,
                        ]);
                    }
                }
            }
        }

        $zip->close();

        // Clear cached department lists
        Cache::forget('portal:departments_hierarchy');
        Cache::forget('portal:districts_tehsils');
    }

    /**
     * Parse cell values from XML row handling inline strings and values.
     */
    protected function parseRowCells($row): array
    {
        $cells = [];
        foreach ($row->c as $c) {
            $col = preg_replace('/[0-9]/', '', (string) $c['r']);
            $val = '';
            if (isset($c->is->t)) {
                $val = (string) $c->is->t;
            } elseif (isset($c->v)) {
                $val = (string) $c->v;
            }
            $cells[$col] = $val;
        }

        return $cells;
    }

    /**
     * Generate uppercase alphanumeric code from department name as fallback.
     */
    protected function generateCode(string $name): string
    {
        $words = preg_split('/[\s,\-\(\)\/&]+/', $name, -1, PREG_SPLIT_NO_EMPTY);
        $code = '';
        foreach ($words as $word) {
            if (! in_array(strtolower($word), ['and', 'of', 'for', 'the', 'incl', 'department', 'dept', 'ajk'])) {
                $code .= strtoupper(substr($word, 0, 1));
            }
        }

        return substr($code ?: 'DEPT', 0, 10);
    }
}
