import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';

export default function ComplaintSubmit({ districts = [], departments = [] }) {
    const { lang, t } = useLanguage();

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: '',
        cnic: '',
        mobile_number: '',
        district_id: '',
        tehsil_id: '',
        subject: '',
        details: '',
        department_id: '',
        sub_department_id: '',
        category_id: '',
        sub_category_id: '',
        attachments: [],
    });

    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [fileError, setFileError] = useState('');

    // Filter Tehsils based on selected District
    const availableTehsils = useMemo(() => {
        if (!data.district_id) return [];
        const selectedDistrict = districts.find((d) => String(d.id) === String(data.district_id));
        return selectedDistrict ? selectedDistrict.tehsils || [] : [];
    }, [data.district_id, districts]);

    // Filter Sub-Departments and Categories based on selected Department
    const selectedDeptObj = useMemo(() => {
        if (!data.department_id || data.department_id === 'other') return null;
        return departments.find((d) => String(d.id) === String(data.department_id));
    }, [data.department_id, departments]);

    const availableSubDepartments = useMemo(() => {
        return selectedDeptObj ? selectedDeptObj.sub_departments || [] : [];
    }, [selectedDeptObj]);

    const availableCategories = useMemo(() => {
        return selectedDeptObj ? selectedDeptObj.categories || [] : [];
    }, [selectedDeptObj]);

    // Filter Sub-Categories based on selected Category
    const selectedCategoryObj = useMemo(() => {
        if (!data.category_id || data.category_id === 'other') return null;
        return availableCategories.find((c) => String(c.id) === String(data.category_id));
    }, [data.category_id, availableCategories]);

    const availableSubCategories = useMemo(() => {
        return selectedCategoryObj ? selectedCategoryObj.sub_categories || [] : [];
    }, [selectedCategoryObj]);

    // Handle District change
    const handleDistrictChange = (e) => {
        const val = e.target.value;
        setData((prev) => ({
            ...prev,
            district_id: val,
            tehsil_id: '',
        }));
    };

    // Handle Department change
    const handleDepartmentChange = (e) => {
        const val = e.target.value;
        setData((prev) => ({
            ...prev,
            department_id: val,
            sub_department_id: '',
            category_id: '',
            sub_category_id: '',
        }));
    };

    // Handle Category change
    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setData((prev) => ({
            ...prev,
            category_id: val,
            sub_category_id: '',
        }));
    };

    // Handle file input change
    const handleFileChange = (e) => {
        setFileError('');
        const files = Array.from(e.target.files);

        if (files.length > 5) {
            setFileError(t('valFilesMaxCount'));
            return;
        }

        for (let file of files) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setFileError(t('valFileMaxSize'));
                return;
            }
        }

        setAttachmentFiles(files);
        setData('attachments', files);
    };

    // Client-side Validation & Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        let hasError = false;

        if (!data.name.trim()) {
            setError('name', t('valNameReq'));
            hasError = true;
        }

        const cleanCnic = data.cnic.replace(/[^0-9]/g, '');
        if (!cleanCnic) {
            setError('cnic', t('valCnicReq'));
            hasError = true;
        } else if (cleanCnic.length !== 13) {
            setError('cnic', t('valCnicFormat'));
            hasError = true;
        }

        const cleanMobile = data.mobile_number.replace(/[^0-9]/g, '');
        if (!cleanMobile) {
            setError('mobile_number', t('valMobileReq'));
            hasError = true;
        } else if (!/^(03|\+?923)[0-9]{9}$/.test(cleanMobile)) {
            setError('mobile_number', t('valMobileFormat'));
            hasError = true;
        }

        if (!data.district_id) {
            setError('district_id', t('valDistrictReq'));
            hasError = true;
        }

        if (!data.tehsil_id) {
            setError('tehsil_id', t('valTehsilReq'));
            hasError = true;
        }

        if (!data.subject.trim()) {
            setError('subject', t('valSubjectReq'));
            hasError = true;
        } else if (data.subject.length > 100) {
            setError('subject', t('valSubjectMax'));
            hasError = true;
        }

        if (!data.details.trim()) {
            setError('details', t('valDetailsReq'));
            hasError = true;
        } else if (data.details.trim().length < 50) {
            setError('details', t('valDetailsMin'));
            hasError = true;
        }

        if (!data.department_id) {
            setError('department_id', t('valDepartmentReq'));
            hasError = true;
        }

        if (hasError) return;

        // Submit form via Inertia POST
        post('/complaints', {
            forceFormData: true,
        });
    };

    return (
        <PublicLayout>
            <Head title={t('submitTitle')} />

            {/* Header Banner with AJK Badge */}
            <div className="mb-8 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-amber-400/80 text-[#034d28] text-xs font-bold mb-3 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>{lang === 'ur' ? 'حکومتِ آزاد کشمیر — عوامی شکایات پورٹل' : 'Govt of Azad Jammu & Kashmir — Citizen Grievance Portal'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight mb-2">
                    {t('submitTitle')}
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {t('submitSubtitle')}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-amber-500 via-[#046A38] to-amber-500 mx-auto mt-3 rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* SECTION 1: Personal Information */}
                <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500">
                    <h2 className="text-lg font-bold text-emerald-950 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-[#034d28] text-amber-300 ring-2 ring-amber-400/80 flex items-center justify-center text-xs font-black shadow-sm">1</span>
                        {t('sectionPersonal')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t('labelName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('placeholderName')}
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    errors.name ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                }`}
                            />
                            {errors.name && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>}
                        </div>

                        {/* CNIC */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t('labelCnic')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.cnic}
                                maxLength={13}
                                onChange={(e) => setData('cnic', e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder={t('placeholderCnic')}
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    errors.cnic ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                }`}
                            />
                            {errors.cnic && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.cnic}</p>}
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t('labelMobile')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.mobile_number}
                                maxLength={11}
                                onChange={(e) => setData('mobile_number', e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder={t('placeholderMobile')}
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    errors.mobile_number ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                }`}
                            />
                            {errors.mobile_number && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.mobile_number}</p>}
                        </div>

                        {/* District */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t('labelDistrict')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.district_id}
                                onChange={handleDistrictChange}
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    errors.district_id ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                }`}
                            >
                                <option value="">{t('selectDistrict')}</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {lang === 'ur' ? d.name_ur || d.name : d.name}
                                    </option>
                                ))}
                            </select>
                            {errors.district_id && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.district_id}</p>}
                        </div>

                        {/* Tehsil */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t('labelTehsil')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.tehsil_id}
                                onChange={(e) => setData('tehsil_id', e.target.value)}
                                disabled={!data.district_id}
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    !data.district_id ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' :
                                    errors.tehsil_id ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                }`}
                            >
                                <option value="">
                                    {data.district_id ? t('selectTehsilActive') : t('selectTehsil')}
                                </option>
                                {availableTehsils.map((tItem) => (
                                    <option key={tItem.id} value={tItem.id}>
                                        {lang === 'ur' ? tItem.name_ur || tItem.name : tItem.name}
                                    </option>
                                ))}
                            </select>
                            {errors.tehsil_id && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.tehsil_id}</p>}
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Department & Category */}
                <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500">
                    <h2 className="text-lg font-bold text-emerald-950 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-[#034d28] text-amber-300 ring-2 ring-amber-400/80 flex items-center justify-center text-xs font-black shadow-sm">2</span>
                        {t('sectionCategory')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Department */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t('labelDepartment')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.department_id}
                                onChange={handleDepartmentChange}
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    errors.department_id ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                }`}
                            >
                                <option value="">{t('selectDepartment')}</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {lang === 'ur' ? dept.name_ur || dept.name : dept.name}
                                    </option>
                                ))}
                                <option value="other">{t('optOther')}</option>
                            </select>
                            {errors.department_id && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.department_id}</p>}
                        </div>

                        {/* Sub-Department (If available and not 'other') */}
                        {data.department_id && data.department_id !== 'other' && availableSubDepartments.length > 0 && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    {t('labelSubDepartment')}
                                </label>
                                <select
                                    value={data.sub_department_id}
                                    onChange={(e) => setData('sub_department_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                                >
                                    <option value="">{t('selectSubDepartment')}</option>
                                    {availableSubDepartments.map((sd) => (
                                        <option key={sd.id} value={sd.id}>
                                            {lang === 'ur' ? sd.name_ur || sd.name : sd.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Category (Hidden if Department is 'other') */}
                        {data.department_id && data.department_id !== 'other' && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    {t('labelCategory')}
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={handleCategoryChange}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                                >
                                    <option value="">{t('selectCategory')}</option>
                                    {availableCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {lang === 'ur' ? cat.name_ur || cat.name : cat.name}
                                        </option>
                                    ))}
                                    <option value="other">{t('optOther')}</option>
                                </select>
                            </div>
                        )}

                        {/* Sub-Category (If main category selected and has sub-categories) */}
                        {data.category_id && data.category_id !== 'other' && availableSubCategories.length > 0 && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    {t('labelSubCategory')}
                                </label>
                                <select
                                    value={data.sub_category_id}
                                    onChange={(e) => setData('sub_category_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                                >
                                    <option value="">{t('selectSubCategory')}</option>
                                    {availableSubCategories.map((sc) => (
                                        <option key={sc.id} value={sc.id}>
                                            {lang === 'ur' ? sc.name_ur || sc.name : sc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 3: Complaint Content */}
                <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500">
                    <h2 className="text-lg font-bold text-emerald-950 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-[#034d28] text-amber-300 ring-2 ring-amber-400/80 flex items-center justify-center text-xs font-black shadow-sm">3</span>
                        {t('sectionComplaint')}
                    </h2>

                    <div className="space-y-6">
                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t('labelSubject')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.subject}
                                maxLength={100}
                                onChange={(e) => setData('subject', e.target.value)}
                                placeholder={t('placeholderSubject')}
                                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    errors.subject ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                }`}
                            />
                            <div className="flex justify-between items-center mt-1 text-xs">
                                {errors.subject ? (
                                    <p className="text-red-600 font-medium">{errors.subject}</p>
                                ) : <span />}
                                <span className="text-slate-400 font-mono">{data.subject.length}/100</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                {t('labelDetails')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={6}
                                value={data.details}
                                onChange={(e) => setData('details', e.target.value)}
                                placeholder={t('placeholderDetails')}
                                className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${
                                    errors.details ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                }`}
                            />
                            <div className="flex justify-between items-center mt-1.5 text-xs">
                                {errors.details ? (
                                    <p className="text-red-600 font-medium">{errors.details}</p>
                                ) : (
                                    <span className="text-slate-500">{t('charCounter', { count: data.details.length })}</span>
                                )}
                                <span className={`font-mono font-semibold ${data.details.length < 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {data.details.length} chars
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: Attachments */}
                <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500">
                    <h2 className="text-lg font-bold text-emerald-950 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-[#034d28] text-amber-300 ring-2 ring-amber-400/80 flex items-center justify-center text-xs font-black shadow-sm">4</span>
                        {t('sectionAttachments')}
                    </h2>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            {t('labelAttachments')}
                        </label>
                        <p className="text-xs text-slate-500 mb-3">{t('attachmentsHint')}</p>

                        <input
                            type="file"
                            multiple
                            accept="image/*,audio/*,video/*,application/pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-300 rounded-xl p-1"
                        />

                        {fileError && <p className="mt-2 text-xs text-red-600 font-medium">{fileError}</p>}

                        {attachmentFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-semibold text-emerald-700">
                                    {t('filesSelected', { count: attachmentFiles.length })}
                                </p>
                                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-xs">
                                    {attachmentFiles.map((file, idx) => (
                                        <li key={idx} className="px-4 py-2 flex justify-between items-center text-slate-700">
                                            <span className="truncate max-w-xs">{file.name}</span>
                                            <span className="text-slate-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#034d28] via-[#046A38] to-[#034d28] hover:from-[#023b1f] hover:to-[#034d28] text-white font-extrabold text-base rounded-xl shadow-lg hover:shadow-xl transition-all border-b-4 border-amber-500 active:border-b-0 active:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2.5"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t('btnSubmitting')}</span>
                            </>
                        ) : (
                            <span>{t('btnSubmit')}</span>
                        )}
                    </button>
                </div>
            </form>
        </PublicLayout>
    );
}
