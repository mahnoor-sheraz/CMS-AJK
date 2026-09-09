import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { IMaskInput } from 'react-imask';

// ─── Step definitions (mirrors V0 page.tsx) ─────────────────────────────────
const STEPS_EN = [
    { number: '01', title: 'Your details',   caption: 'Who are you?'    },
    { number: '02', title: 'Location',        caption: 'Where is it?'    },
    { number: '03', title: 'Your complaint',  caption: 'What happened?'  },
    { number: '04', title: 'Review',          caption: 'Ready to send'   },
];
const STEPS_UR = [
    { number: '01', title: 'آپ کی تفصیلات', caption: 'آپ کون ہیں؟'       },
    { number: '02', title: 'مقام',           caption: 'کہاں کا مسئلہ ہے؟' },
    { number: '03', title: 'آپ کی شکایت',   caption: 'کیا ہوا؟'           },
    { number: '04', title: 'جائزہ',          caption: 'بھیجنے کے لیے تیار' },
];

export default function ComplaintSubmit({ districts: rawDistricts = [], departments: rawDepartments = [] }) {
    const { lang } = useLanguage();
    const isRtl  = lang === 'ur';
    const steps  = isRtl ? STEPS_UR : STEPS_EN;

    const districts   = useMemo(() => Array.isArray(rawDistricts)   ? rawDistricts   : Object.values(rawDistricts   || {}), [rawDistricts]);
    const departments = useMemo(() => Array.isArray(rawDepartments) ? rawDepartments : Object.values(rawDepartments || {}), [rawDepartments]);

    const [currentStep, setCurrentStep] = useState(1);
    const [declarationAccepted, setDeclarationAccepted] = useState(false);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: '',
        cnic: '',
        mobile_number: '',
        gender: '',
        district_id: '',
        tehsil_id: '',
        department_id: '',
        sub_department_id: '',
        category_id: '',
        sub_category_id: '',
        subject: '',
        details: '',
        attachments: [],
    });

    // ── Attachment state ─────────────────────────────────────────────────────
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [fileError, setFileError]             = useState('');
    const fileInputRef                          = useRef(null);
    const photoInputRef                         = useRef(null);
    const videoInputRef                         = useRef(null);

    // ── Camera / video capture state ─────────────────────────────────────────
    const [cameraOpen, setCameraOpen]         = useState(false);
    const [captureMode, setCaptureMode]       = useState('photo');
    const [cameraError, setCameraError]       = useState('');
    const [isRecording, setIsRecording]       = useState(false);
    const [timeLeft, setTimeLeft]             = useState(60);
    const videoRef                            = useRef(null);
    const canvasRef                           = useRef(null);
    const streamRef                           = useRef(null);
    const recorderRef                         = useRef(null);
    const chunksRef                           = useRef([]);
    const timerRef                            = useRef(null);

    useEffect(() => () => { stopStream(); if (timerRef.current) clearInterval(timerRef.current); }, []);

    // ── Derived lists ────────────────────────────────────────────────────────
    const availableTehsils = useMemo(() => {
        const d = districts.find(d => String(d.id) === String(data.district_id));
        if (!d) return [];
        return Array.isArray(d.tehsils) ? d.tehsils : Object.values(d.tehsils || {});
    }, [data.district_id, districts]);

    const selectedDept = useMemo(() =>
        departments.find(d => String(d.id) === String(data.department_id)) ?? null,
    [data.department_id, departments]);

    const availableSubDepts = useMemo(() => {
        const subs = selectedDept?.sub_departments ?? selectedDept?.subDepartments ?? [];
        return Array.isArray(subs) ? subs : Object.values(subs);
    }, [selectedDept]);

    const availableCategories = useMemo(() => {
        const cats = selectedDept?.categories ?? [];
        return Array.isArray(cats) ? cats : Object.values(cats);
    }, [selectedDept]);

    const selectedCategory = useMemo(() =>
        availableCategories.find(c => String(c.id) === String(data.category_id)) ?? null,
    [data.category_id, availableCategories]);

    const availableSubCategories = useMemo(() => {
        const sc = selectedCategory?.sub_categories ?? selectedCategory?.subCategories ?? [];
        return Array.isArray(sc) ? sc : Object.values(sc);
    }, [selectedCategory]);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const label = (en, ur) => isRtl ? ur : en;

    const dname = (item) => (isRtl ? item.name_ur || item.name : item.name);

    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const focusFirstError = () =>
        setTimeout(() => {
            const el = document.querySelector('.field-error, [data-error="true"]');
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 60);

    // ── Citizen CNIC auto-fill ───────────────────────────────────────────────
    const handleCnicBlur = async () => {
        const clean = data.cnic.replace(/\D/g, '');
        if (clean.length !== 13) return;
        try {
            const res = await fetch(`/complaints/api/citizen/${clean}`);
            if (!res.ok) return;
            const citizen = await res.json();
            if (citizen) setData(prev => ({
                ...prev,
                name:          prev.name          || citizen.name          || '',
                mobile_number: prev.mobile_number || citizen.mobile_number || '',
                gender:        prev.gender        || citizen.gender        || '',
            }));
        } catch {}
    };

    // ── Attachments ──────────────────────────────────────────────────────────
    const addFiles = (newFiles) => {
        setFileError('');
        const combined = [...attachmentFiles, ...newFiles];
        if (combined.length > 5) { setFileError(label('Maximum 5 files allowed.', 'زیادہ سے زیادہ 5 فائلز کی اجازت ہے۔')); return false; }
        for (const f of newFiles) {
            if (f.size > 10 * 1024 * 1024) { setFileError(label('Each file must be under 10 MB.', 'ہر فائل 10 MB سے کم ہونی چاہیے۔')); return false; }
        }
        setAttachmentFiles(combined);
        setData('attachments', combined);
        return true;
    };
    const removeFile = (i) => {
        const updated = attachmentFiles.filter((_, idx) => idx !== i);
        setAttachmentFiles(updated);
        setData('attachments', updated);
    };
    const onFileChange = (e) => {
        if (e.target.files?.length) addFiles(Array.from(e.target.files));
        e.target.value = '';
    };

    // ── Camera ───────────────────────────────────────────────────────────────
    const stopStream = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    };
    const openCamera = async (mode) => {
        setCaptureMode(mode); setCameraError(''); setCameraOpen(true);
        setIsRecording(false); setTimeLeft(60);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, audio: mode === 'video',
            });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        } catch { setCameraError(label('Camera access denied. Use the upload button instead.', 'کیمرہ تک رسائی نہیں۔ اپ لوڈ بٹن استعمال کریں۔')); }
    };
    const closeCamera = () => {
        if (isRecording) stopRecording();
        stopStream(); setCameraOpen(false); setCameraError('');
    };
    const snapPhoto = () => {
        const v = videoRef.current, c = canvasRef.current;
        if (!v || !c) return;
        c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(blob => {
            if (blob) { addFiles([new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })]); closeCamera(); }
        }, 'image/jpeg', 0.85);
    };
    const startRecording = () => {
        if (!streamRef.current) return;
        chunksRef.current = [];
        const rec = new MediaRecorder(streamRef.current);
        recorderRef.current = rec;
        rec.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
        rec.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            addFiles([new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' })]);
            closeCamera();
        };
        rec.start(1000); setIsRecording(true); setTimeLeft(60);
        let t = 60;
        timerRef.current = setInterval(() => { t--; setTimeLeft(t); if (t <= 0) { clearInterval(timerRef.current); stopRecording(); } }, 1000);
    };
    const stopRecording = () => {
        clearInterval(timerRef.current);
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
        setIsRecording(false);
    };

    // ── Validation ───────────────────────────────────────────────────────────
    const validate = (step) => {
        clearErrors(); let ok = true;
        const err = (field, msg) => { setError(field, msg); ok = false; };
        if (step === 1) {
            if (!data.name.trim())                                err('name', label('Full name is required.', 'پورا نام ضروری ہے۔'));
            else if (data.name.trim().length < 2)                err('name', label('Name is too short.', 'نام بہت مختصر ہے۔'));
            if ((data.cnic.replace(/\D/g, '')).length !== 13)    err('cnic', label('Enter a valid 13-digit CNIC.', 'درست 13 ہندسی CNIC درج کریں۔'));
            if (!/^(03|\+?923)\d{9}$/.test(data.mobile_number.replace(/\D/g, '')))
                err('mobile_number', label('Enter a valid Pakistani mobile number.', 'درست پاکستانی موبائل نمبر درج کریں۔'));
        }
        if (step === 2) {
            if (!data.district_id) err('district_id', label('Please select a district.', 'ضلع منتخب کریں۔'));
            if (!data.tehsil_id)   err('tehsil_id',   label('Please select a tehsil.',  'تحصیل منتخب کریں۔'));
        }
        if (step === 3) {
            if (!data.department_id)          err('department_id', label('Please select a department.', 'محکمہ منتخب کریں۔'));
            if (!data.subject.trim())         err('subject',       label('Subject is required.', 'موضوع ضروری ہے۔'));
            else if (data.subject.length > 100) err('subject',     label('Subject must be under 100 characters.', 'موضوع 100 حروف سے کم ہونا چاہیے۔'));
            if (data.details.trim().length < 50) err('details',    label('Please describe your complaint in at least 50 characters.', 'شکایت کم از کم 50 حروف میں بیان کریں۔'));
        }
        if (step === 4) {
            if (!declarationAccepted) err('declaration', label('You must accept the declaration to submit.', 'جمع کرانے کے لیے اعلامیہ قبول کریں۔'));
        }
        if (!ok) focusFirstError();
        return ok;
    };

    const goNext = () => { if (validate(currentStep)) { setCurrentStep(s => Math.min(s + 1, 4)); scrollTop(); } };
    const goBack = () => { setCurrentStep(s => Math.max(s - 1, 1)); scrollTop(); };
    const goTo   = (n) => {
        if (n < currentStep) { setCurrentStep(n); scrollTop(); return; }
        for (let s = currentStep; s < n; s++) if (!validate(s)) return;
        setCurrentStep(n); scrollTop();
    };

    const handleSubmit = (e) => {
        e.preventDefault(); clearErrors();
        if (!validate(1)) { setCurrentStep(1); return; }
        if (!validate(2)) { setCurrentStep(2); return; }
        if (!validate(3)) { setCurrentStep(3); return; }
        if (!validate(4)) { setCurrentStep(4); return; }
        post('/complaints', {
            forceFormData: true,
            onError: (errs) => {
                if (errs.name || errs.cnic || errs.mobile_number) setCurrentStep(1);
                else if (errs.district_id || errs.tehsil_id)      setCurrentStep(2);
                else if (errs.department_id || errs.subject || errs.details) setCurrentStep(3);
                else setCurrentStep(4);
                focusFirstError();
            },
        });
    };

    // ── Review helpers ───────────────────────────────────────────────────────
    const districtName    = useMemo(() => { const d = districts.find(d => String(d.id) === String(data.district_id)); return d ? dname(d) : '—'; }, [data.district_id, districts, lang]);
    const tehsilName      = useMemo(() => { const t = availableTehsils.find(t => String(t.id) === String(data.tehsil_id)); return t ? dname(t) : '—'; }, [data.tehsil_id, availableTehsils, lang]);
    const departmentName  = useMemo(() => { if (data.department_id === 'other') return label('Other / Unknown', 'دیگر / معلوم نہیں'); const d = departments.find(d => String(d.id) === String(data.department_id)); return d ? dname(d) : '—'; }, [data.department_id, departments, lang]);
    const subDeptName     = useMemo(() => { const s = availableSubDepts.find(s => String(s.id) === String(data.sub_department_id)); return s ? dname(s) : label('None', 'کوئی نہیں'); }, [data.sub_department_id, availableSubDepts, lang]);
    const categoryName    = useMemo(() => { if (data.category_id === 'other') return label('Other', 'دیگر'); const c = availableCategories.find(c => String(c.id) === String(data.category_id)); return c ? dname(c) : '—'; }, [data.category_id, availableCategories, lang]);
    const subCategoryName = useMemo(() => { const s = availableSubCategories.find(s => String(s.id) === String(data.sub_category_id)); return s ? dname(s) : label('None', 'کوئی نہیں'); }, [data.sub_category_id, availableSubCategories, lang]);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <PublicLayout>
            <Head title={label('File a Complaint — PMCC', 'شکایت درج کریں — PMCC')} />

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Native file inputs for fallback */}
            <input ref={fileInputRef}  type="file" multiple accept="image/*,audio/*,video/*,application/pdf" className="hidden" onChange={onFileChange} />
            <input ref={photoInputRef} type="file" accept="image/*"  capture="environment" className="hidden" onChange={onFileChange} />
            <input ref={videoInputRef} type="file" accept="video/*"  capture="environment" className="hidden" onChange={onFileChange} />

            {/* ═══════════════════════════════════════════════
                CONTENT WRAP — matches V0 .content-wrap
                ═══════════════════════════════════════════════ */}
            <div className="content-wrap" dir={isRtl ? 'rtl' : 'ltr'}>

                {/* ── Hero / Intro ── */}
                <section className="intro" aria-labelledby="page-title">
                    <div>
                        <p className="overline">
                            {label(
                                `Complaint submission · 0${currentStep} / 04`,
                                `شکایت جمع کرائیں · 0${currentStep} / 04`,
                            )}
                        </p>
                        <h1 id="page-title">
                            {label("Let's get your", 'آئیے آپ کی')}
                            <br />
                            <em>{label('voice heard.', 'آواز سنوائیں۔')}</em>
                        </h1>
                    </div>
                    <p className="intro-copy">
                        {label(
                            'Start by telling us a little about yourself. Your information is kept secure and used only to follow up on your complaint.',
                            'اپنے بارے میں کچھ بتا کر شروع کریں۔ آپ کی معلومات محفوظ رکھی جاتی ہیں اور صرف آپ کی شکایت پر کارروائی کے لیے استعمال ہوتی ہیں۔',
                        )}
                    </p>
                </section>

                {/* ── 4-Step Journey — exactly like V0 ── */}
                <section className="journey" aria-label={label('Complaint submission progress', 'شکایت جمع کرانے کا عمل')}>
                    <div className="journey-line" aria-hidden="true" />
                    {steps.map((step, idx) => {
                        const stepNum  = idx + 1;
                        const isCurrent   = stepNum === currentStep;
                        const isCompleted = stepNum < currentStep;
                        return (
                            <button
                                key={step.number}
                                type="button"
                                onClick={() => goTo(stepNum)}
                                disabled={stepNum > currentStep}
                                aria-current={isCurrent ? 'step' : undefined}
                                className={`journey-step${isCurrent ? ' current' : ''}${isCompleted ? ' completed' : ''}`}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: stepNum > currentStep ? 'default' : 'pointer', textAlign: isRtl ? 'right' : 'left' }}
                            >
                                <span aria-hidden="true">
                                    {isCompleted
                                        ? <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        : step.number
                                    }
                                </span>
                                <div>
                                    <strong>{step.title}</strong>
                                    <small>{step.caption}</small>
                                </div>
                            </button>
                        );
                    })}
                </section>

                {/* ═══════════════════════════════════════════════════════
                    FORM
                    ═══════════════════════════════════════════════════════ */}
                <form onSubmit={handleSubmit}>

                    {/* ─────────────────────────────────────────
                        STEP 1 — Your details (V0 Step 1)
                        ───────────────────────────────────────── */}
                    {currentStep === 1 && (
                        <section className="form-card" id="complaint" aria-labelledby="form-title">
                            <div className="section-heading">
                                <div>
                                    <p className="section-kicker">{label('Step one', 'پہلا قدم')}</p>
                                    <h2 id="form-title">{label('About you', 'آپ کے بارے میں')}</h2>
                                </div>
                                <p className="required-note"><span>*</span> {label('Required fields', 'مطلوبہ خانے')}</p>
                            </div>

                            <div className="form-grid">
                                {/* Full name */}
                                <label>
                                    <span className="form-label-title">{label('Full name', 'پورا نام')} <span className="req-star">*</span></span>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        maxLength={100}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder={label('Enter your full name', 'اپنا مکمل نام درج کریں')}
                                        data-error={!!errors.name}
                                        style={errors.name ? { borderColor: '#e53e3e' } : {}}
                                    />
                                    {errors.name && <span className="field-error" style={{ color: '#e53e3e', fontSize: '.75rem', fontWeight: 600, marginTop: '.2rem', display: 'block' }}>{errors.name}</span>}
                                </label>

                                {/* CNIC */}
                                <label>
                                    <span className="form-label-title">{label('CNIC number', 'قومی شناختی کارڈ نمبر')} <span className="req-star">*</span></span>
                                    <IMaskInput
                                        mask="00000-0000000-0"
                                        value={data.cnic}
                                        dir="ltr"
                                        unmask={false}
                                        onAccept={val => setData('cnic', val)}
                                        onBlur={handleCnicBlur}
                                        placeholder="00000-0000000-0"
                                        data-error={!!errors.cnic}
                                        style={errors.cnic ? { borderColor: '#e53e3e' } : {}}
                                    />
                                    {errors.cnic && <span className="field-error" style={{ color: '#e53e3e', fontSize: '.75rem', fontWeight: 600, marginTop: '.2rem', display: 'block' }}>{errors.cnic}</span>}
                                </label>

                                {/* Mobile */}
                                <label>
                                    <span className="form-label-title">{label('Mobile number', 'موبائل نمبر')} <span className="req-star">*</span></span>
                                    <IMaskInput
                                        mask="0000-0000000"
                                        value={data.mobile_number}
                                        dir="ltr"
                                        unmask={false}
                                        onAccept={val => setData('mobile_number', val)}
                                        placeholder="0300-0000000"
                                        data-error={!!errors.mobile_number}
                                        style={errors.mobile_number ? { borderColor: '#e53e3e' } : {}}
                                    />
                                    {errors.mobile_number && <span className="field-error" style={{ color: '#e53e3e', fontSize: '.75rem', fontWeight: 600, marginTop: '.2rem', display: 'block' }}>{errors.mobile_number}</span>}
                                </label>

                                {/* Gender — plain <select> exactly like V0 */}
                                <label>
                                    <span className="form-label-title">{label('Gender', 'جنس')} <em>{label('Optional', 'اختیاری')}</em></span>
                                    <select
                                        value={data.gender}
                                        onChange={e => setData('gender', e.target.value)}
                                    >
                                        <option value="">{label('Prefer not to say', 'بتانا نہیں چاہتے')}</option>
                                        <option value="male">{label('Male', 'مرد')}</option>
                                        <option value="female">{label('Female', 'خاتون')}</option>
                                    </select>
                                </label>
                            </div>

                            {/* Footer — V0 exact layout */}
                            <div className="form-footer">
                                <p>
                                    <span className="privacy-dot" aria-hidden="true" />
                                    {label('Your details are protected and never shared publicly.', 'آپ کی تفصیلات محفوظ ہیں اور کبھی عوامی سطح پر شیئر نہیں کی جاتیں۔')}
                                </p>
                                <button type="button" onClick={goNext} className="continue-button" id="step1-continue">
                                    {label('Continue', 'جاری رکھیں')} <span aria-hidden="true">{isRtl ? '←' : '→'}</span>
                                </button>
                            </div>
                        </section>
                    )}

                    {/* ─────────────────────────────────────────
                        STEP 2 — Location
                        ───────────────────────────────────────── */}
                    {currentStep === 2 && (
                        <section className="form-card" aria-labelledby="step2-title">
                            <div className="section-heading">
                                <div>
                                    <p className="section-kicker">{label('Step two', 'دوسرا قدم')}</p>
                                    <h2 id="step2-title">{label('Location', 'مقام')}</h2>
                                </div>
                                <p className="required-note"><span>*</span> {label('Required fields', 'مطلوبہ خانے')}</p>
                            </div>

                            <div className="form-grid">
                                {/* District */}
                                <label>
                                    <span className="form-label-title">{label('District', 'ضلع')} <span className="req-star">*</span></span>
                                    <select
                                        value={data.district_id}
                                        onChange={e => setData(prev => ({ ...prev, district_id: e.target.value, tehsil_id: '' }))}
                                        style={errors.district_id ? { borderColor: '#e53e3e' } : {}}
                                    >
                                        <option value="">{label('Select district', 'ضلع منتخب کریں')}</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{dname(d)}</option>)}
                                    </select>
                                    {errors.district_id && <span className="field-error" style={{ color: '#e53e3e', fontSize: '.75rem', fontWeight: 600, marginTop: '.2rem', display: 'block' }}>{errors.district_id}</span>}
                                </label>

                                {/* Tehsil */}
                                <label>
                                    <span className="form-label-title">{label('Tehsil', 'تحصیل')} <span className="req-star">*</span></span>
                                    <select
                                        value={data.tehsil_id}
                                        onChange={e => setData('tehsil_id', e.target.value)}
                                        disabled={!data.district_id}
                                        style={errors.tehsil_id ? { borderColor: '#e53e3e' } : {}}
                                    >
                                        <option value="">{data.district_id ? label('Select tehsil', 'تحصیل منتخب کریں') : label('Select district first', 'پہلے ضلع منتخب کریں')}</option>
                                        {availableTehsils.map(t => <option key={t.id} value={t.id}>{dname(t)}</option>)}
                                    </select>
                                    {errors.tehsil_id && <span className="field-error" style={{ color: '#e53e3e', fontSize: '.75rem', fontWeight: 600, marginTop: '.2rem', display: 'block' }}>{errors.tehsil_id}</span>}
                                </label>
                            </div>

                            <div className="form-footer">
                                <button type="button" onClick={goBack} style={{ background: 'none', border: '1.5px solid var(--line)', borderRadius: '.65rem', padding: '.85rem 1.25rem', color: 'var(--muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span aria-hidden="true">{isRtl ? '→' : '←'}</span> {label('Back', 'پیچھے')}
                                </button>
                                <button type="button" onClick={goNext} className="continue-button">
                                    {label('Continue', 'جاری رکھیں')} <span aria-hidden="true">{isRtl ? '←' : '→'}</span>
                                </button>
                            </div>
                        </section>
                    )}

                    {/* ─────────────────────────────────────────
                        STEP 3 — Your complaint
                        ───────────────────────────────────────── */}
                    {currentStep === 3 && (
                        <section className="form-card" aria-labelledby="step3-title">
                            <div className="section-heading">
                                <div>
                                    <p className="section-kicker">{label('Step three', 'تیسرا قدم')}</p>
                                    <h2 id="step3-title">{label('Your complaint', 'آپ کی شکایت')}</h2>
                                </div>
                                <p className="required-note"><span>*</span> {label('Required fields', 'مطلوبہ خانے')}</p>
                            </div>

                            <div className="form-grid">
                                {/* Department */}
                                <label>
                                    <span className="form-label-title">{label('Department', 'محکمہ')} <span className="req-star">*</span></span>
                                    <select
                                        value={data.department_id}
                                        onChange={e => setData(prev => ({ ...prev, department_id: e.target.value, sub_department_id: '', category_id: '', sub_category_id: '' }))}
                                        style={errors.department_id ? { borderColor: '#e53e3e' } : {}}
                                    >
                                        <option value="">{label('Select department', 'محکمہ منتخب کریں')}</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{dname(d)}</option>)}
                                        <option value="other">{label('Other / Unknown', 'دیگر / معلوم نہیں')}</option>
                                    </select>
                                    {errors.department_id && <span className="field-error" style={{ color: '#e53e3e', fontSize: '.75rem', fontWeight: 600, marginTop: '.2rem', display: 'block' }}>{errors.department_id}</span>}
                                </label>

                                {/* Sub-Department */}
                                {data.department_id && data.department_id !== 'other' && availableSubDepts.length > 0 && (
                                    <label>
                                        <span className="form-label-title">{label('Sub-department', 'ذیلی محکمہ')} <em>{label('Optional', 'اختیاری')}</em></span>
                                        <select value={data.sub_department_id} onChange={e => setData('sub_department_id', e.target.value)}>
                                            <option value="">{label('Select sub-department', 'ذیلی محکمہ منتخب کریں')}</option>
                                            {availableSubDepts.map(s => <option key={s.id} value={s.id}>{dname(s)}</option>)}
                                        </select>
                                    </label>
                                )}

                                {/* Category */}
                                {data.department_id && data.department_id !== 'other' && availableCategories.length > 0 && (
                                    <label>
                                        <span className="form-label-title">{label('Category', 'قسم')} <em>{label('Optional', 'اختیاری')}</em></span>
                                        <select value={data.category_id} onChange={e => setData(prev => ({ ...prev, category_id: e.target.value, sub_category_id: '' }))}>
                                            <option value="">{label('Select category', 'قسم منتخب کریں')}</option>
                                            {availableCategories.map(c => <option key={c.id} value={c.id}>{dname(c)}</option>)}
                                            <option value="other">{label('Other', 'دیگر')}</option>
                                        </select>
                                    </label>
                                )}

                                {/* Sub-category */}
                                {data.category_id && data.category_id !== 'other' && availableSubCategories.length > 0 && (
                                    <label>
                                        <span className="form-label-title">{label('Sub-category', 'ذیلی قسم')} <em>{label('Optional', 'اختیاری')}</em></span>
                                        <select value={data.sub_category_id} onChange={e => setData('sub_category_id', e.target.value)}>
                                            <option value="">{label('Select sub-category', 'ذیلی قسم منتخب کریں')}</option>
                                            {availableSubCategories.map(s => <option key={s.id} value={s.id}>{dname(s)}</option>)}
                                        </select>
                                    </label>
                                )}
                            </div>

                            {/* Subject — full width below grid */}
                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={{ display: 'grid', gap: '.55rem', color: 'var(--foreground)', fontSize: '.9rem', fontWeight: 800 }}>
                                    <span className="form-label-title">{label('Subject', 'موضوع')} <span className="req-star">*</span></span>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        maxLength={100}
                                        onChange={e => setData('subject', e.target.value)}
                                        placeholder={label('Brief title for your complaint', 'شکایت کا مختصر عنوان')}
                                        style={errors.subject ? { borderColor: '#e53e3e' } : {}}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                         {errors.subject ? <span style={{ color: '#e53e3e', fontSize: '.75rem', fontWeight: 600 }}>{errors.subject}</span> : <span />}
                                        <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{data.subject.length}/100</span>
                                    </div>
                                </label>
                            </div>

                            {/* Details — full width */}
                            <div style={{ marginTop: '1.25rem' }}>
                                <label style={{ display: 'grid', gap: '.55rem', color: 'var(--foreground)', fontSize: '.9rem', fontWeight: 800 }}>
                                    <span className="form-label-title">{label('Details', 'تفصیل')} <span className="req-star">*</span></span>
                                    <textarea
                                        rows={6}
                                        value={data.details}
                                        onChange={e => setData('details', e.target.value)}
                                        placeholder={label('Describe your complaint clearly — what happened, when, where, and who is involved.', 'اپنی شکایت واضح الفاظ میں بیان کریں — کیا ہوا، کب، کہاں، اور کون ملوث ہے۔')}
                                        style={{ resize: 'vertical', minHeight: '10rem', ...(errors.details ? { borderColor: '#e53e3e' } : {}) }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        {errors.details
                                            ? <span style={{ color: '#e53e3e', fontSize: '.75rem', fontWeight: 600 }}>{errors.details}</span>
                                            : <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{label('Minimum 50 characters', 'کم از کم 50 حروف')}</span>}
                                        <span style={{ fontSize: '.72rem', fontFamily: 'monospace', color: data.details.length < 50 ? 'var(--coral)' : '#237653', fontWeight: 700 }}>{data.details.length}</span>
                                    </div>
                                </label>
                            </div>

                            <div className="form-footer">
                                <button type="button" onClick={goBack} style={{ background: 'none', border: '1.5px solid var(--line)', borderRadius: '.65rem', padding: '.85rem 1.25rem', color: 'var(--muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                    <span aria-hidden="true">{isRtl ? '→' : '←'}</span> {label('Back', 'پیچھے')}
                                </button>
                                <button type="button" onClick={goNext} className="continue-button">
                                    {label('Continue', 'جاری رکھیں')} <span aria-hidden="true">{isRtl ? '←' : '→'}</span>
                                </button>
                            </div>
                        </section>
                    )}

                    {/* ─────────────────────────────────────────
                        STEP 4 — Review & Attachments
                        ───────────────────────────────────────── */}
                    {currentStep === 4 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Attachments card */}
                            <section className="form-card" aria-labelledby="attach-title">
                                <div className="section-heading">
                                    <div>
                                        <p className="section-kicker">{label('Step four', 'چوتھا قدم')}</p>
                                        <h2 id="attach-title">{label('Attachments', 'دستاویزات')}</h2>
                                    </div>
                                </div>
                                <p style={{ margin: '.75rem 0 1rem', fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                                    {label('Add photos, videos, or documents as evidence (optional). Max 5 files, 10 MB each.', 'ثبوت کے طور پر تصاویر، ویڈیو یا دستاویزات شامل کریں (اختیاری)۔ زیادہ سے زیادہ 5 فائلز، ہر ایک 10 MB۔')}
                                </p>

                                {/* Upload buttons */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1rem' }}>
                                    {[
                                        { icon: '📎', text: label('Upload file', 'فائل اپ لوڈ کریں'), action: () => fileInputRef.current?.click() },
                                        { icon: '📷', text: label('Take photo', 'تصویر لیں'),        action: () => openCamera('photo') },
                                        { icon: '🎥', text: label('Record video', 'ویڈیو ریکارڈ کریں'), action: () => openCamera('video') },
                                    ].map(btn => (
                                        <button key={btn.text} type="button" onClick={btn.action}
                                            style={{ padding: '.85rem .75rem', borderRadius: '.75rem', border: '1.5px solid var(--line)', background: 'var(--background)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem', fontWeight: 700, fontSize: '.8rem', color: 'var(--foreground)', transition: 'border-color .15s' }}>
                                            <span style={{ fontSize: '1.4rem' }}>{btn.icon}</span>
                                            {btn.text}
                                        </button>
                                    ))}
                                </div>

                                {/* Camera error fallback */}
                                {cameraError && (
                                    <div style={{ margin: '0 0 .75rem', padding: '.75rem 1rem', borderRadius: '.65rem', background: '#fffbeb', border: '1px solid #f6c431', color: '#7a4f00', fontSize: '.82rem', display: 'flex', gap: '.5rem' }}>
                                        <span>⚠️</span> <span>{cameraError}</span>
                                    </div>
                                )}

                                {/* File error */}
                                {fileError && (
                                    <div style={{ margin: '0 0 .75rem', padding: '.75rem 1rem', borderRadius: '.65rem', background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', fontSize: '.82rem', fontWeight: 600 }}>
                                        {fileError}
                                    </div>
                                )}

                                {/* File list */}
                                {attachmentFiles.length > 0 ? (
                                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid var(--line)', borderRadius: '.75rem', overflow: 'hidden' }}>
                                        {attachmentFiles.map((f, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 1rem', borderBottom: i < attachmentFiles.length - 1 ? '1px solid var(--line)' : 'none', fontSize: '.82rem', background: 'var(--surface)' }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                    <span style={{ width: '.4rem', height: '.4rem', borderRadius: '50%', background: '#237653', flexShrink: 0 }} />
                                                    {f.name}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
                                                    <span style={{ fontFamily: 'monospace', fontSize: '.72rem', color: 'var(--muted)' }}>{(f.size / 1048576).toFixed(2)} MB</span>
                                                    <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '1rem', padding: '.2rem', lineHeight: 1 }}>✕</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div style={{ padding: '.75rem', textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)', border: '1.5px dashed var(--line)', borderRadius: '.75rem' }}>
                                        {label('No attachments added', 'کوئی منسلکات نہیں')}
                                    </div>
                                )}
                            </section>

                            {/* Review summary card */}
                            <section className="form-card" aria-labelledby="review-title">
                                <div style={{ paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--line)' }}>
                                    <h2 id="review-title" style={{ margin: 0, color: 'var(--primary)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-.04em' }}>{label('Review', 'جائزہ')}</h2>
                                    <p style={{ margin: '.3rem 0 0', fontSize: '.82rem', color: 'var(--muted)' }}>{label('Check your details before submitting.', 'جمع کرانے سے پہلے اپنی تفصیلات جانچ لیں۔')}</p>
                                </div>

                                {/* Review blocks */}
                                {[
                                    {
                                        titleEn: 'Your details', titleUr: 'آپ کی تفصیلات', step: 1,
                                        rows: [
                                            [label('Full name', 'پورا نام'), data.name || '—'],
                                            [label('CNIC', 'قومی شناختی کارڈ'), data.cnic || '—'],
                                            [label('Mobile', 'موبائل'), data.mobile_number || '—'],
                                            [label('Gender', 'جنس'), data.gender === 'male' ? label('Male', 'مرد') : data.gender === 'female' ? label('Female', 'خاتون') : label('Not specified', 'غیر متعین')],
                                        ],
                                    },
                                    {
                                        titleEn: 'Location', titleUr: 'مقام', step: 2,
                                        rows: [
                                            [label('District', 'ضلع'), districtName],
                                            [label('Tehsil', 'تحصیل'), tehsilName],
                                        ],
                                    },
                                    {
                                        titleEn: 'Complaint', titleUr: 'شکایت', step: 3,
                                        rows: [
                                            [label('Department', 'محکمہ'), departmentName],
                                            ...(data.sub_department_id ? [[label('Sub-dept', 'ذیلی محکمہ'), subDeptName]] : []),
                                            ...(data.category_id ? [[label('Category', 'قسم'), categoryName]] : []),
                                            ...(data.sub_category_id ? [[label('Sub-category', 'ذیلی قسم'), subCategoryName]] : []),
                                            [label('Subject', 'موضوع'), data.subject || '—'],
                                        ],
                                    },
                                ].map(block => (
                                    <div key={block.step} style={{ padding: '1rem', borderRadius: '.75rem', background: '#f4f7f6', border: '1px solid var(--line)', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '.72rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{isRtl ? block.titleUr : block.titleEn}</h3>
                                            <button type="button" onClick={() => goTo(block.step)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '.78rem', fontWeight: 700, color: 'var(--ring)', padding: '.2rem .5rem' }}>✏ {label('Edit', 'ترمیم')}</button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.6rem .75rem', fontSize: '.84rem' }}>
                                            {block.rows.map(([lbl, val]) => (
                                                <div key={lbl}>
                                                    <span style={{ display: 'block', fontSize: '.7rem', color: 'var(--muted)', marginBottom: '.15rem' }}>{lbl}</span>
                                                    <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {block.step === 3 && data.details && (
                                            <div style={{ marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid var(--line)' }}>
                                                <span style={{ display: 'block', fontSize: '.7rem', color: 'var(--muted)', marginBottom: '.3rem' }}>{label('Details', 'تفصیل')}</span>
                                                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: '.84rem', color: 'var(--foreground)', padding: '.65rem .85rem', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '.5rem' }}>{data.details}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Declaration */}
                                <div style={{ padding: '1rem 1.25rem', borderRadius: '.75rem', border: `2px solid ${errors.declaration ? '#e53e3e' : 'var(--coral)'}`, background: errors.declaration ? '#fff5f5' : '#fffbeb', marginBottom: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '.85rem', cursor: 'pointer', userSelect: 'none', fontWeight: 600, fontSize: '.88rem', lineHeight: 1.6, color: 'var(--foreground)' }}>
                                        <input
                                            type="checkbox"
                                            className="declaration-checkbox"
                                            checked={declarationAccepted}
                                            onChange={e => { setDeclarationAccepted(e.target.checked); if (errors.declaration) clearErrors('declaration'); }}
                                            style={{ margin: 0, width: '1.15rem', height: '1.15rem', minHeight: '1.15rem', maxHeight: '1.15rem', padding: 0, cursor: 'pointer', flexShrink: 0, accentColor: 'var(--primary)' }}
                                        />
                                        <span>
                                            {label(
                                                'I declare that the information provided is true and correct to the best of my knowledge.',
                                                'میں اعلان کرتا / کرتی ہوں کہ فراہم کردہ معلومات میری بہترین معلومات کے مطابق درست ہیں۔',
                                            )} <span style={{ color: 'var(--coral)' }}>*</span>
                                        </span>
                                    </label>
                                    {errors.declaration && <p style={{ margin: '.4rem 0 0 2rem', fontSize: '.78rem', color: '#e53e3e', fontWeight: 700 }}>⚠ {errors.declaration}</p>}
                                </div>

                                {/* Server errors */}
                                {(errors.general || errors.rate_limit) && (
                                    <div style={{ padding: '1rem', borderRadius: '.75rem', background: '#fffbeb', border: '2px solid var(--yellow)', marginBottom: '1rem', fontSize: '.85rem', color: '#7a4f00' }}>
                                        {errors.rate_limit
                                            ? <><strong>{label('Too many submissions.', 'بہت زیادہ جمع کرانے کی کوشش۔')}</strong> {errors.rate_limit}</>
                                            : <><strong>{label('Submission failed.', 'جمع کرانا ناکام ہوا۔')}</strong> {errors.general}</>}
                                    </div>
                                )}

                                <div className="form-footer">
                                    <button type="button" onClick={goBack} style={{ background: 'none', border: '1.5px solid var(--line)', borderRadius: '.65rem', padding: '.85rem 1.25rem', color: 'var(--muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                        <span aria-hidden="true">{isRtl ? '→' : '←'}</span> {label('Back', 'پیچھے')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="continue-button"
                                        id="final-submit"
                                        style={{ opacity: processing ? .6 : 1, paddingLeft: '2rem', paddingRight: '2rem' }}
                                    >
                                        {processing
                                            ? label('Submitting…', 'جمع ہو رہا ہے…')
                                            : <>{label('Submit complaint', 'شکایت جمع کریں')} <span aria-hidden="true">✓</span></>}
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}
                </form>

                {/* Help line — V0 exact */}
                <p className="help-line">
                    {label('Need help? Call ', 'مدد چاہیے؟ کال کریں ')}
                    <strong>0800-786-01</strong>
                    {label(' · Available in English and Urdu', ' · اردو اور انگریزی میں دستیاب')}
                </p>
            </div>

            {/* ═══════════════════════════════════════════════
                IN-BROWSER CAMERA MODAL
                ═══════════════════════════════════════════════ */}
            {cameraOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.8)', padding: '1rem', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: '100%', maxWidth: '30rem', background: '#0f172a', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,.6)', border: '1px solid #334155' }}>
                        <div style={{ padding: '.85rem 1rem', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                            <strong style={{ color: '#fff', fontSize: '.9rem' }}>{captureMode === 'video' ? label('Record video', 'ویڈیو ریکارڈ کریں') : label('Take photo', 'تصویر لیں')}</strong>
                            <button type="button" onClick={closeCamera} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem' }}>✕</button>
                        </div>
                        <div style={{ position: 'relative', background: '#000', minHeight: '15rem', maxHeight: '24rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', objectFit: 'cover' }} />
                            {captureMode === 'video' && isRecording && (
                                <div style={{ position: 'absolute', top: '.75rem', right: '.75rem', background: 'rgba(239,68,68,.9)', color: '#fff', padding: '.25rem .65rem', borderRadius: '999px', fontSize: '.72rem', fontFamily: 'monospace', fontWeight: 700 }}>
                                    ● {timeLeft}s
                                </div>
                            )}
                            {cameraError && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
                                    <p style={{ color: '#fcd34d', fontSize: '.88rem' }}>{cameraError}</p>
                                </div>
                            )}
                        </div>
                        {!cameraError && (
                            <div style={{ padding: '.85rem 1rem', background: '#1e293b', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155' }}>
                                <button type="button" onClick={closeCamera} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 600, fontSize: '.85rem' }}>{label('Cancel', 'منسوخ')}</button>
                                {captureMode === 'photo'
                                    ? <button type="button" onClick={snapPhoto} style={{ padding: '.55rem 1.25rem', background: 'var(--coral)', border: 'none', borderRadius: '.65rem', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '.88rem' }}>{label('Capture', 'تصویر لیں')}</button>
                                    : !isRecording
                                        ? <button type="button" onClick={startRecording} style={{ padding: '.55rem 1.25rem', background: '#ef4444', border: 'none', borderRadius: '.65rem', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '.88rem' }}>{label('Record', 'ریکارڈ کریں')}</button>
                                        : <button type="button" onClick={stopRecording} style={{ padding: '.55rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '.65rem', color: '#ef4444', fontWeight: 900, cursor: 'pointer', fontSize: '.88rem' }}>{label('Stop', 'رکیں')}</button>
                                }
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
