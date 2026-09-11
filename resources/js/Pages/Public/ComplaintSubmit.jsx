import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { IMaskInput } from 'react-imask';

import { getSubjectSuggestions } from '@/data/complaintSubjects';

export default function ComplaintSubmit({ districts: rawDistricts = [], departments: rawDepartments = [] }) {
    const { lang } = useLanguage();
    const isRtl = lang === 'ur';

    const districts   = useMemo(() => Array.isArray(rawDistricts)   ? rawDistricts   : Object.values(rawDistricts   || {}), [rawDistricts]);
    const departments = useMemo(() => Array.isArray(rawDepartments) ? rawDepartments : Object.values(rawDepartments || {}), [rawDepartments]);

    const [currentStep, setCurrentStep] = useState(1);
    const [declarationAccepted, setDeclarationAccepted] = useState(false);
    const [subjOpen, setSubjOpen] = useState(false);

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

    useEffect(() => () => {
        stopStream();
        if (timerRef.current) clearInterval(timerRef.current);
        attachmentFiles.forEach(f => { if (f._preview) URL.revokeObjectURL(f._preview); });
    }, []);

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

    const [isLocating, setIsLocating] = useState(false);
    const [locateMessage, setLocateMessage] = useState(null);

    // ── Locate Me (GPS with graceful fallback) ──────────────────────────────
    const handleLocateMe = () => {
        setLocateMessage(null);
        if (!navigator.geolocation) {
            setLocateMessage({
                type: 'info',
                text: label(
                    'Geolocation is not supported by your browser. Please select your district and tehsil manually below.',
                    'آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔ براہِ کرم نیچے دیے گئے ڈراپ ڈاؤن سے ضلع اور تحصیل منتخب کریں۔'
                ),
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Approximate reverse geocoding via OpenStreetMap Nominatim
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );
                    if (res.ok) {
                        const json = await res.json();
                        const address = json.address || {};
                        const targetCounty = (address.county || address.state_district || address.city || '').toLowerCase();
                        const targetTown = (address.town || address.village || address.suburb || address.city_district || '').toLowerCase();

                        // Match district in AJK
                        let matchedDistrict = districts.find(d => 
                            (d.name && targetCounty.includes(d.name.toLowerCase())) ||
                            (d.name && d.name.toLowerCase().includes(targetCounty))
                        );

                        if (matchedDistrict) {
                            setData(prev => ({
                                ...prev,
                                district_id: matchedDistrict.id,
                                tehsil_id: '',
                            }));
                            if (errors.district_id) clearErrors('district_id');

                            // Match tehsil if available
                            const tehsils = Array.isArray(matchedDistrict.tehsils) 
                                ? matchedDistrict.tehsils 
                                : Object.values(matchedDistrict.tehsils || {});
                            const matchedTehsil = tehsils.find(t => 
                                (t.name && targetTown.includes(t.name.toLowerCase())) ||
                                (t.name && t.name.toLowerCase().includes(targetTown))
                            );

                            if (matchedTehsil) {
                                setData(prev => ({
                                    ...prev,
                                    district_id: matchedDistrict.id,
                                    tehsil_id: matchedTehsil.id,
                                }));
                                if (errors.tehsil_id) clearErrors('tehsil_id');
                            }

                            setLocateMessage({
                                type: 'success',
                                text: label(
                                    `Detected: ${matchedDistrict.name}${matchedTehsil ? ` (${matchedTehsil.name})` : ''}. You can change it anytime manually below.`,
                                    `شناخت شدہ: ${dname(matchedDistrict)}${matchedTehsil ? ` (${dname(matchedTehsil)})` : ''}۔ اگر ضرورت ہو تو آپ نیچے دستی طور پر تبدیل کر سکتے ہیں۔`
                                ),
                            });
                        } else {
                            setLocateMessage({
                                type: 'info',
                                text: label(
                                    'Could not automatically detect your exact AJK district. Please choose manually from the list below.',
                                    'آپ کے ضلع کی خودکار شناخت نہیں ہو سکی۔ براہِ کرم نیچے دیے گئے ڈراپ ڈاؤن سے ضلع منتخب کریں۔'
                                ),
                            });
                        }
                    }
                } catch {
                    setLocateMessage({
                        type: 'info',
                        text: label(
                            'Location lookup service is currently slow. Please select your district and tehsil manually.',
                            'لوکیشن سروس اس وقت مصروف ہے۔ براہِ کرم نیچے سے اپنا ضلع اور تحصیل دستی طور پر منتخب کریں۔'
                        ),
                    });
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                setIsLocating(false);
                setLocateMessage({
                    type: 'info',
                    text: label(
                        'Location access not granted. Please select your district and tehsil manually from the dropdowns.',
                        'لوکیشن کی اجازت دستیاب نہیں ہے۔ براہِ کرم نیچے دیے گئے ڈراپ ڈاؤنز سے ضلع اور تحصیل خود منتخب کریں۔'
                    ),
                });
            },
            { timeout: 9000, enableHighAccuracy: false }
        );
    };

    // ── Attachments ──────────────────────────────────────────────────────────
    const addFiles = (newFiles) => {
        setFileError('');
        const processed = Array.from(newFiles).map(f => {
            if (f.type.startsWith('image/')) {
                f._preview = URL.createObjectURL(f);
            }
            return f;
        });
        const combined = [...attachmentFiles, ...processed];
        if (combined.length > 5) {
            setFileError(label('Maximum 5 files allowed.', 'زیادہ سے زیادہ 5 فائلز کی اجازت ہے۔'));
            return false;
        }
        for (const f of newFiles) {
            if (f.size > 10 * 1024 * 1024) {
                setFileError(label('Each file must be under 10 MB.', 'ہر فائل 10 MB سے کم ہونی چاہیے۔'));
                return false;
            }
        }
        setAttachmentFiles(combined);
        setData('attachments', combined);
        return true;
    };

    const removeFile = (i) => {
        const fileToRemove = attachmentFiles[i];
        if (fileToRemove?._preview) URL.revokeObjectURL(fileToRemove._preview);
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
            if (!data.name.trim())                                err('name', label('Please enter your full name.', 'براہِ کرم اپنا پورا نام درج کریں۔'));
            else if (data.name.trim().length < 2)                err('name', label('Name is too short.', 'نام بہت مختصر ہے۔'));
            const cnicDigits = data.cnic.replace(/\D/g, '');
            if (cnicDigits.length !== 13)                        err('cnic', label('Enter a valid 13-digit CNIC.', 'درست ۱۳ ہندسوں کا شناختی کارڈ نمبر درج کریں۔'));
            const phoneDigits = data.mobile_number.replace(/\D/g, '');
            if (!/^(03[0-7]\d{8}|923[0-7]\d{8})$/.test(phoneDigits))
                err('mobile_number', label('Enter a valid mobile number.', 'درست موبائل نمبر درج کریں۔'));
        }
        if (step === 2) {
            if (!data.district_id) err('district_id', label('Please choose a district.', 'براہِ کرم ضلع منتخب کریں۔'));
            if (!data.tehsil_id)   err('tehsil_id',   label('Please choose a tehsil.',   'براہِ کرم تحصیل منتخب کریں۔'));
        }
        if (step === 3) {
            if (!data.department_id)          err('department_id', label('Please choose a department.', 'براہِ کرم محکمہ منتخب کریں۔'));
            if (!data.subject.trim())         err('subject',       label('Please give your complaint a subject.', 'براہِ کرم شکایت کا موضوع لکھیں۔'));
            else if (data.subject.length > 100) err('subject',     label('Subject must be under 100 characters.', 'موضوع ۱۰۰ حروف سے کم ہونا چاہیے۔'));
            if (data.details.trim().length < 20) err('details',    label('Please describe the problem in at least 20 characters.', 'براہِ کرم مسئلہ کم از کم ۲۰ حروف میں بیان کریں۔'));
        }
        if (step === 4) {
            if (!declarationAccepted) err('declaration', label('Please confirm before submitting.', 'جمع کروانے سے پہلے تصدیق کریں۔'));
        }
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

    // Typography & styles per design contract
    const uiFont = isRtl ? "'Noto Naskh Arabic', 'Archivo', sans-serif" : "'Archivo', sans-serif";
    const displayFont = isRtl ? "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" : "'Archivo', sans-serif";

    const stepTitles = [
        label('About you', 'آپ کے بارے میں'),
        label('Where it happened', 'واقعہ کہاں پیش آیا'),
        label('Your complaint', 'آپ کی شکایت'),
        label('Review and submit', 'جائزہ اور اندراج')
    ];

    const stepBlurbs = [
        label('We need this to keep you updated and to verify the complaint.', 'یہ معلومات آپ کو باخبر رکھنے اور شکایت کی تصدیق کے لیے درکار ہیں۔'),
        label('Pinpointing the location routes your complaint to the right office.', 'درست مقام سے آپ کی شکایت صحیح دفتر تک پہنچتی ہے۔'),
        label('Be specific. Details help the department act faster.', 'واضح لکھیں۔ تفصیل سے محکمہ تیزی سے کارروائی کر سکتا ہے۔'),
        label('Check everything below. You can still go back and change it.', 'نیچے دی گئی تفصیلات دیکھ لیں۔ آپ اب بھی واپس جا کر تبدیلی کر سکتے ہیں۔')
    ];

    const railItems = [
        { nEn: '01', nUr: '۰۱', t: label('Your details', 'آپ کی تفصیلات'), d: label('Who you are', 'آپ کون ہیں') },
        { nEn: '02', nUr: '۰۲', t: label('Location', 'مقام'), d: label('Where it happened', 'واقعہ کہاں ہوا') },
        { nEn: '03', nUr: '۰۳', t: label('Your complaint', 'آپ کی شکایت'), d: label('What went wrong', 'کیا مسئلہ ہے') },
        { nEn: '04', nUr: '۰۴', t: label('Review', 'جائزہ'), d: label('Check and submit', 'دیکھ کر جمع کروائیں') },
    ];

    const filteredSubj = useMemo(() => {
        return getSubjectSuggestions(selectedDept, selectedCategory, data.subject);
    }, [selectedDept, selectedCategory, data.subject]);

    const progressPct = `${currentStep * 25}%`;

    return (
        <PublicLayout>
            <Head title={label('File a Complaint — PMCC', 'شکایت درج کریں — PMCC')} />

            {/* Hidden canvas for camera fallback */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Native file inputs */}
            <input ref={fileInputRef}  type="file" multiple accept="image/*,audio/*,video/*,application/pdf" style={{ display: 'none' }} onChange={onFileChange} />
            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={onFileChange} />
            <input ref={videoInputRef} type="file" accept="video/*" capture="environment" style={{ display: 'none' }} onChange={onFileChange} />

            {/* Camera / Video Live Capture Modal */}
            {cameraOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', maxWidth: '520px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '14px 20px', background: '#344e41', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontFamily: uiFont }}>{captureMode === 'photo' ? label('Take Photo', 'تصویر لیں') : label('Record Video', 'ویڈیو ریکارڈ کریں')}</span>
                            <button type="button" onClick={closeCamera} style={{ background: 'none', border: 0, color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ position: 'relative', background: '#000', display: 'grid', placeItems: 'center', minHeight: '280px' }}>
                            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: '340px', objectFit: 'contain' }} />
                            {isRecording && (
                                <div style={{ position: 'absolute', top: 12, insetInlineStart: 12, background: 'rgba(236,48,19,0.9)', color: '#fff', borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
                                    <span>{timeLeft}s</span>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '12px', background: '#faf7f2' }}>
                            {captureMode === 'photo' ? (
                                <button type="button" onClick={snapPhoto} style={{ background: '#344e41', color: '#fff', border: 0, borderRadius: '999px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
                                    {label('Capture Photo', 'تصویر محفوظ کریں')}
                                </button>
                            ) : (
                                isRecording ? (
                                    <button type="button" onClick={stopRecording} style={{ background: '#ec3013', color: '#fff', border: 0, borderRadius: '999px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
                                        {label('Stop Recording', 'ریکارڈنگ روکیں')}
                                    </button>
                                ) : (
                                    <button type="button" onClick={startRecording} style={{ background: '#344e41', color: '#fff', border: 0, borderRadius: '999px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
                                        {label('Start Recording', 'ریکارڈنگ شروع کریں')}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                EXACT TWO-COLUMN MODERNIST POSTER CONTAINER (Matching akj-.zip)
                ═════════════════════════════════════════════════════════════════ */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '21px', alignItems: 'stretch', width: '100%', maxWidth: '1140px', margin: '0 auto' }}>

                {/* ── LEFT COLUMN: POSTER SIDEBAR (Golden ratio ~38.2% of container) ── */}
                <aside
                    style={{
                        flex: '0 0 350px',
                        width: '350px',
                        maxWidth: '100%',
                        minWidth: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(158deg, #344e41, #283d33)',
                        color: '#f6fbf7',
                        borderRadius: '21px',
                        padding: '22px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        boxShadow: '0 14px 34px rgba(42,38,35,.1)',
                    }}
                >
                    {/* Floating ambient radial gold glow orb */}
                    <div
                        style={{
                            position: 'absolute',
                            insetInlineEnd: '-60px',
                            top: '-60px',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 32% 32%, rgba(200,137,26,.34), rgba(200,137,26,0) 70%)',
                            pointerEvents: 'none',
                            animation: 'pmccFloat 9s ease-in-out infinite',
                        }}
                    />

                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '11.5px',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                letterSpacing: '.02em',
                                color: '#e2ae4e',
                                background: 'rgba(200,137,26,.15)',
                                borderRadius: '999px',
                                padding: '5px 12px',
                                width: 'fit-content',
                            }}
                        >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e2ae4e', display: 'block' }} />
                            {label('Citizen complaint', 'عوامی شکایت')}
                        </div>

                        <h1
                            style={{
                                fontFamily: displayFont,
                                fontWeight: 800,
                                color: '#eeb84e',
                                fontSize: isRtl ? 'clamp(21px, 2.2vw, 26px)' : 'clamp(23px, 2.4vw, 28px)',
                                lineHeight: isRtl ? 1.6 : 1.15,
                                letterSpacing: isRtl ? 'normal' : '-.015em',
                                margin: '14px 0 0',
                            }}
                        >
                            {label("Let's get your voice heard.", 'آپ کی بات، براہِ راست وزیرِ اعظم تک')}
                        </h1>

                        <p
                            style={{
                                margin: '12px 0 0',
                                fontSize: '13.5px',
                                maxWidth: '38ch',
                                color: 'rgba(255,255,255,.8)',
                                lineHeight: 1.5,
                            }}
                        >
                            {label(
                                'Four short steps, and your complaint reaches the department responsible and the Prime Minister’s Contact Centre.',
                                'چار آسان مراحل، اور آپ کی شکایت متعلقہ محکمے اور وزیرِ اعظم رابطہ مرکز تک پہنچ جائے گی۔'
                            )}
                        </p>
                    </div>

                    {/* 4-Step Vertical Progress Rail */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {railItems.map((s, idx) => {
                            const stepNum = idx + 1;
                            const isActive = currentStep === stepNum;
                            const isDone = currentStep > stepNum;

                            return (
                                <button
                                    key={stepNum}
                                    type="button"
                                    onClick={() => goTo(stepNum)}
                                    style={{
                                        width: '100%',
                                        background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
                                        border: 0,
                                        borderRadius: '13px',
                                        padding: '9px 12px',
                                        font: 'inherit',
                                        color: 'inherit',
                                        textAlign: 'start',
                                        cursor: 'pointer',
                                        display: 'grid',
                                        gridTemplateColumns: 'auto 1fr',
                                        gap: '11px',
                                        alignItems: 'center',
                                        transition: 'background .25s, transform .25s cubic-bezier(.2,.8,.2,1)',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '50%',
                                            display: 'grid',
                                            placeItems: 'center',
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 800,
                                            fontSize: '12.5px',
                                            background: isActive ? '#eeb84e' : isDone ? 'rgba(238,184,78,.2)' : 'transparent',
                                            color: isActive ? '#344e41' : isDone ? '#eeb84e' : 'rgba(255,255,255,.5)',
                                            border: `1.5px solid ${isActive ? '#eeb84e' : isDone ? 'rgba(238,184,78,.55)' : 'rgba(255,255,255,.22)'}`,
                                            transition: 'background .3s, color .3s, border-color .3s',
                                        }}
                                    >
                                        {isRtl ? s.nUr : s.nEn}
                                    </span>
                                    <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                                        <span
                                            style={{
                                                fontFamily: uiFont,
                                                fontWeight: 700,
                                                fontSize: '13.5px',
                                                color: isActive ? '#fff' : isDone ? '#f6fbf7' : 'rgba(255,255,255,.7)',
                                                transition: 'color .3s',
                                            }}
                                        >
                                            {s.t}
                                        </span>
                                        <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.55)' }}>
                                            {s.d}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Encrypted & Confidential Lock Badge */}
                    <div
                        style={{
                            marginTop: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '11.5px',
                            color: 'rgba(255,255,255,.8)',
                            background: 'rgba(255,255,255,.07)',
                            borderRadius: '13px',
                            padding: '9px 12px',
                            fontFamily: uiFont,
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e2ae4e" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>{label('Encrypted and confidential', 'محفوظ اور رازدارانہ')}</span>
                    </div>
                </aside>

                {/* ── RIGHT COLUMN: FORM CARD (Golden Ratio ~61.8% of container) ── */}
                <section
                    style={{
                        flex: '1 1 540px',
                        background: '#fff',
                        borderRadius: '21px',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        overflow: 'hidden',
                        boxShadow: '0 14px 34px rgba(42,38,35,.08)',
                    }}
                >
                    {/* Top Golden Progress Fill Bar */}
                    <div style={{ height: '4px', background: '#f0eae0' }}>
                        <div
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #c8891a, #eeb84e)',
                                borderEndEndRadius: '999px',
                                borderStartEndRadius: '999px',
                                width: progressPct,
                                transition: 'width .7s cubic-bezier(.2,.8,.2,1)',
                            }}
                        />
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            padding: '22px 26px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            flex: 1,
                        }}
                    >
                        {/* Step Header Block */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                            <div>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: '#fdf3e0',
                                        color: '#8a5c07',
                                        borderRadius: '999px',
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        padding: '5px 12px',
                                    }}
                                >
                                    {isRtl ? `مرحلہ ${['۰۱', '۰۲', '۰۳', '۰۴'][currentStep - 1]} از ۰۴` : `Step ${currentStep} of 4`}
                                </span>
                                <h2
                                    style={{
                                        fontFamily: displayFont,
                                        fontWeight: 800,
                                        color: '#344e41',
                                        fontSize: isRtl ? 'clamp(18px, 1.8vw, 23px)' : 'clamp(20px, 2vw, 25px)',
                                        letterSpacing: isRtl ? 'normal' : '-.015em',
                                        margin: '10px 0 0',
                                    }}
                                >
                                    {stepTitles[currentStep - 1]}
                                </h2>
                                <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#6b645e', maxWidth: '52ch', lineHeight: 1.5 }}>
                                    {stepBlurbs[currentStep - 1]}
                                </p>
                            </div>
                            <span style={{ fontSize: '11.5px', color: '#6b645e', whiteSpace: 'nowrap' }}>
                                <span style={{ color: '#ec3013', fontWeight: 700 }}>*</span> {label('Required fields', 'مطلوبہ خانے')}
                            </span>
                        </div>

                        {/* Step Content with Entry Animation */}
                        <div key={currentStep} className="animate-pmcc-enter" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                            {/* ═════════════════════════════════════
                                STEP 1: ABOUT YOU
                                ═════════════════════════════════════ */}
                            {currentStep === 1 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                                    {/* Full Name */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label htmlFor="pmcc-name-input" style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                            {label('Full name', 'پورا نام')} <span style={{ color: '#ec3013' }}>*</span>
                                        </label>
                                        <div style={{ position: 'relative', display: 'flex' }}>
                                            <span style={{ position: 'absolute', insetInlineStart: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a9a29b', pointerEvents: 'none', display: 'flex' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                                                    <circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" />
                                                </svg>
                                            </span>
                                            <input
                                                id="pmcc-name-input"
                                                type="text"
                                                name="name"
                                                autoComplete="name"
                                                className="pmcc-input"
                                                value={data.name}
                                                onChange={e => { setData('name', e.target.value); if (errors.name) clearErrors('name'); }}
                                                placeholder={label('Enter your full name', 'اپنا مکمل نام درج کریں')}
                                                style={{
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    background: '#faf7f2',
                                                    border: `1.5px solid ${errors.name ? '#ec3013' : '#e6ded2'}`,
                                                    borderRadius: '13px',
                                                    font: 'inherit',
                                                    fontSize: '14px',
                                                    padding: '10px 14px',
                                                    paddingInlineStart: '40px',
                                                    color: '#2a2623',
                                                    outline: 'none',
                                                    transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                }}
                                            />
                                        </div>
                                        {errors.name && (
                                            <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>
                                                {errors.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* CNIC Number */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label htmlFor="pmcc-cnic-input" style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                            {label('CNIC number', 'قومی شناختی کارڈ نمبر')} <span style={{ color: '#ec3013' }}>*</span>
                                        </label>
                                        <div style={{ position: 'relative', display: 'flex' }}>
                                            <span style={{ position: 'absolute', insetInlineStart: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a9a29b', pointerEvents: 'none', display: 'flex' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                                                    <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
                                                </svg>
                                            </span>
                                            <IMaskInput
                                                id="pmcc-cnic-input"
                                                name="national-id"
                                                autoComplete="off"
                                                mask="00000-0000000-0"
                                                className="pmcc-input"
                                                value={data.cnic}
                                                onAccept={val => { setData('cnic', val); if (errors.cnic) clearErrors('cnic'); }}
                                                placeholder="00000-0000000-0"
                                                dir="ltr"
                                                style={{
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    background: '#faf7f2',
                                                    border: `1.5px solid ${errors.cnic ? '#ec3013' : '#e6ded2'}`,
                                                    borderRadius: '13px',
                                                    font: 'inherit',
                                                    fontSize: '14px',
                                                    padding: '10px 14px',
                                                    paddingInlineStart: '40px',
                                                    color: '#2a2623',
                                                    outline: 'none',
                                                    transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                }}
                                            />
                                        </div>
                                        {errors.cnic && (
                                            <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>
                                                {errors.cnic}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile Number */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label htmlFor="pmcc-mobile-input" style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                            {label('Mobile number', 'موبائل نمبر')} <span style={{ color: '#ec3013' }}>*</span>
                                        </label>
                                        <div style={{ position: 'relative', display: 'flex' }}>
                                            <span style={{ position: 'absolute', insetInlineStart: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a9a29b', pointerEvents: 'none', display: 'flex' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                                                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" />
                                                </svg>
                                            </span>
                                            <IMaskInput
                                                id="pmcc-mobile-input"
                                                name="tel"
                                                autoComplete="tel"
                                                mask="0000-0000000"
                                                className="pmcc-input"
                                                value={data.mobile_number}
                                                onAccept={val => { setData('mobile_number', val); if (errors.mobile_number) clearErrors('mobile_number'); }}
                                                placeholder="0300-0000000"
                                                dir="ltr"
                                                style={{
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    background: '#faf7f2',
                                                    border: `1.5px solid ${errors.mobile_number ? '#ec3013' : '#e6ded2'}`,
                                                    borderRadius: '13px',
                                                    font: 'inherit',
                                                    fontSize: '14px',
                                                    padding: '10px 14px',
                                                    paddingInlineStart: '40px',
                                                    color: '#2a2623',
                                                    outline: 'none',
                                                    transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                }}
                                            />
                                        </div>
                                        {errors.mobile_number && (
                                            <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>
                                                {errors.mobile_number}
                                            </span>
                                        )}
                                    </div>

                                    {/* Gender (Optional) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label htmlFor="pmcc-gender-select" style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                            {label('Gender', 'جنس')} <span style={{ color: '#a9a29b', fontWeight: 500 }}>{label('(optional)', '(اختیاری)')}</span>
                                        </label>
                                        <div style={{ position: 'relative', display: 'flex' }}>
                                            <select
                                                id="pmcc-gender-select"
                                                name="sex"
                                                autoComplete="sex"
                                                className="pmcc-input"
                                                value={data.gender}
                                                onChange={e => setData('gender', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    appearance: 'none',
                                                    background: '#faf7f2',
                                                    border: '1.5px solid #e6ded2',
                                                    borderRadius: '13px',
                                                    font: 'inherit',
                                                    fontSize: '14px',
                                                    padding: '10px 14px',
                                                    paddingInlineEnd: '38px',
                                                    color: '#2a2623',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                }}
                                            >
                                                <option value="">{label('Prefer not to say', 'بتانا نہیں چاہتے')}</option>
                                                <option value="male">{label('Male', 'مرد')}</option>
                                                <option value="female">{label('Female', 'عورت')}</option>
                                                <option value="other">{label('Other', 'دیگر')}</option>
                                            </select>
                                            <span style={{ position: 'absolute', insetInlineEnd: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b645e', pointerEvents: 'none', display: 'flex' }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═════════════════════════════════════
                                STEP 2: WHERE IT HAPPENED
                                ═════════════════════════════════════ */}
                            {currentStep === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {/* Locate Me Button & Fallback Notice */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: '#faf7f2',
                                            border: '1.5px dashed #e6ded2',
                                            borderRadius: '13px',
                                            padding: '10px 14px',
                                            gap: '12px',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#344e41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="3 11 22 2 13 21 11 13 3 11" />
                                            </svg>
                                            <span style={{ fontSize: '12.5px', color: '#554f49', fontFamily: uiFont }}>
                                                {label('Want to auto-fill your location?', 'کیا آپ اپنی لوکیشن خودکار طور پر درج کرنا چاہتے ہیں؟')}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleLocateMe}
                                            disabled={isLocating}
                                            style={{
                                                background: '#fff',
                                                color: '#344e41',
                                                border: '1.5px solid #d8cfc0',
                                                borderRadius: '999px',
                                                padding: '6px 14px',
                                                fontFamily: uiFont,
                                                fontWeight: 700,
                                                fontSize: '12px',
                                                cursor: isLocating ? 'wait' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 2px 6px rgba(0,0,0,.04)',
                                                transition: 'background .15s, border-color .15s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fdf3e0'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                        >
                                            <span>{isLocating ? (isRtl ? 'تلاش جاری...' : 'Detecting...') : (isRtl ? 'موجودہ مقام استعمال کریں' : 'Locate Me')}</span>
                                        </button>
                                    </div>

                                    {/* Locate message banner */}
                                    {locateMessage && (
                                        <div
                                            className="animate-pmcc-enter"
                                            style={{
                                                background: locateMessage.type === 'success' ? '#eaf2ec' : '#fdf3e0',
                                                border: `1px solid ${locateMessage.type === 'success' ? '#6f8c79' : '#e2ae4e'}`,
                                                borderRadius: '11px',
                                                padding: '9px 13px',
                                                fontSize: '12px',
                                                color: locateMessage.type === 'success' ? '#24392f' : '#8a5c07',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <span>{locateMessage.type === 'success' ? '✓' : 'ℹ'}</span>
                                            <span>{locateMessage.text}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                                        {/* District */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <label style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                                    {label('District', 'ضلع')} <span style={{ color: '#ec3013' }}>*</span>
                                                </label>
                                                <span style={{ fontSize: '11px', color: '#8b847d' }}>
                                                    {label('Pick manually', 'دستی انتخاب')}
                                                </span>
                                            </div>
                                            <div style={{ position: 'relative', display: 'flex' }}>
                                                <select
                                                    className="pmcc-input"
                                                    value={data.district_id}
                                                    onChange={e => {
                                                        setData(prev => ({ ...prev, district_id: e.target.value, tehsil_id: '' }));
                                                        if (errors.district_id) clearErrors('district_id');
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        appearance: 'none',
                                                        background: '#faf7f2',
                                                        border: `1.5px solid ${errors.district_id ? '#ec3013' : '#e6ded2'}`,
                                                        borderRadius: '13px',
                                                        font: 'inherit',
                                                        fontSize: '14px',
                                                        padding: '10px 14px',
                                                        paddingInlineEnd: '38px',
                                                        color: '#2a2623',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                    }}
                                                >
                                                    <option value="">{label('Select a district', 'ضلع منتخب کریں')}</option>
                                                    {districts.map(d => (
                                                        <option key={d.id} value={d.id}>{dname(d)}</option>
                                                    ))}
                                                </select>
                                                <span style={{ position: 'absolute', insetInlineEnd: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b645e', pointerEvents: 'none', display: 'flex' }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </span>
                                            </div>
                                            {errors.district_id && (
                                                <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>
                                                    {errors.district_id}
                                                </span>
                                            )}
                                        </div>

                                        {/* Tehsil */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <label style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                                    {label('Tehsil', 'تحصیل')} <span style={{ color: '#ec3013' }}>*</span>
                                                </label>
                                                <span style={{ fontSize: '11px', color: '#8b847d' }}>
                                                    {label('Pick manually', 'دستی انتخاب')}
                                                </span>
                                            </div>
                                            <div style={{ position: 'relative', display: 'flex' }}>
                                                <select
                                                    className="pmcc-input"
                                                    value={data.tehsil_id}
                                                    disabled={!data.district_id}
                                                    onChange={e => {
                                                        setData('tehsil_id', e.target.value);
                                                        if (errors.tehsil_id) clearErrors('tehsil_id');
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        appearance: 'none',
                                                        background: !data.district_id ? '#f3ede2' : '#faf7f2',
                                                        border: `1.5px solid ${errors.tehsil_id ? '#ec3013' : '#e6ded2'}`,
                                                        borderRadius: '13px',
                                                        font: 'inherit',
                                                        fontSize: '14px',
                                                        padding: '10px 14px',
                                                        paddingInlineEnd: '38px',
                                                        color: !data.district_id ? '#8b847d' : '#2a2623',
                                                        outline: 'none',
                                                        cursor: !data.district_id ? 'not-allowed' : 'pointer',
                                                        transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                    }}
                                                >
                                                    <option value="">{data.district_id ? label('Select a tehsil', 'تحصیل منتخب کریں') : label('Pick a district first', 'پہلے ضلع منتخب کریں')}</option>
                                                    {availableTehsils.map(t => (
                                                        <option key={t.id} value={t.id}>{dname(t)}</option>
                                                    ))}
                                                </select>
                                                <span style={{ position: 'absolute', insetInlineEnd: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b645e', pointerEvents: 'none', display: 'flex' }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </span>
                                            </div>
                                            {errors.tehsil_id && (
                                                <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>
                                                    {errors.tehsil_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═════════════════════════════════════
                                STEP 3: YOUR COMPLAINT
                                ═════════════════════════════════════ */}
                            {currentStep === 3 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                                        {/* Department */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                                {label('Department', 'محکمہ')} <span style={{ color: '#ec3013' }}>*</span>
                                            </label>
                                            <div style={{ position: 'relative', display: 'flex' }}>
                                                <select
                                                    className="pmcc-input"
                                                    value={data.department_id}
                                                    onChange={e => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            department_id: e.target.value,
                                                            sub_department_id: '',
                                                            category_id: '',
                                                            sub_category_id: ''
                                                        }));
                                                        if (errors.department_id) clearErrors('department_id');
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        appearance: 'none',
                                                        background: '#faf7f2',
                                                        border: `1.5px solid ${errors.department_id ? '#ec3013' : '#e6ded2'}`,
                                                        borderRadius: '13px',
                                                        font: 'inherit',
                                                        fontSize: '14px',
                                                        padding: '10px 14px',
                                                        paddingInlineEnd: '38px',
                                                        color: '#2a2623',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                    }}
                                                >
                                                    <option value="">{label('Select the department', 'محکمہ منتخب کریں')}</option>
                                                    {departments.map(d => (
                                                        <option key={d.id} value={d.id}>{dname(d)}</option>
                                                    ))}
                                                    <option value="other">{label('Other / Unknown', 'دیگر / معلوم نہیں')}</option>
                                                </select>
                                                <span style={{ position: 'absolute', insetInlineEnd: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b645e', pointerEvents: 'none', display: 'flex' }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </span>
                                            </div>
                                            {errors.department_id && (
                                                <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>
                                                    {errors.department_id}
                                                </span>
                                            )}
                                        </div>

                                        {/* Category / Sub-dept (Optional cascade) */}
                                        {availableCategories.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                                    {label('Category', 'زمرہ')} <span style={{ color: '#a9a29b', fontWeight: 500 }}>{label('(optional)', '(اختیاری)')}</span>
                                                </label>
                                                <div style={{ position: 'relative', display: 'flex' }}>
                                                    <select
                                                        className="pmcc-input"
                                                        value={data.category_id}
                                                        onChange={e => setData('category_id', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            boxSizing: 'border-box',
                                                            appearance: 'none',
                                                            background: '#faf7f2',
                                                            border: '1.5px solid #e6ded2',
                                                            borderRadius: '13px',
                                                            font: 'inherit',
                                                            fontSize: '14px',
                                                            padding: '10px 14px',
                                                            paddingInlineEnd: '38px',
                                                            color: '#2a2623',
                                                            outline: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                        }}
                                                    >
                                                        <option value="">{label('Select a category', 'زمرہ منتخب کریں')}</option>
                                                        {availableCategories.map(c => (
                                                            <option key={c.id} value={c.id}>{dname(c)}</option>
                                                        ))}
                                                        <option value="other">{label('Other', 'دیگر')}</option>
                                                    </select>
                                                    <span style={{ position: 'absolute', insetInlineEnd: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b645e', pointerEvents: 'none', display: 'flex' }}>
                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Subject with Search Icon & Suggestions Dropdown */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                                        <label style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                            {label('Subject', 'موضوع')} <span style={{ color: '#ec3013' }}>*</span>
                                        </label>
                                        <div style={{ position: 'relative', display: 'flex' }}>
                                            <span style={{ position: 'absolute', insetInlineStart: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a9a29b', pointerEvents: 'none', display: 'flex' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                                                    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                className="pmcc-input"
                                                value={data.subject}
                                                onFocus={() => setSubjOpen(true)}
                                                onBlur={() => setTimeout(() => setSubjOpen(false), 200)}
                                                onChange={e => {
                                                    setData('subject', e.target.value);
                                                    if (errors.subject) clearErrors('subject');
                                                }}
                                                placeholder={label('Start typing — pick a suggestion or write your own', 'لکھنا شروع کریں — تجویز منتخب کریں یا اپنے الفاظ لکھیں')}
                                                autoComplete="off"
                                                style={{
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    background: '#faf7f2',
                                                    border: `1.5px solid ${errors.subject ? '#ec3013' : '#e6ded2'}`,
                                                    borderRadius: '13px',
                                                    font: 'inherit',
                                                    fontSize: '14px',
                                                    padding: '10px 14px',
                                                    paddingInlineStart: '40px',
                                                    color: '#2a2623',
                                                    outline: 'none',
                                                    transition: 'border-color .2s, box-shadow .2s, background .2s',
                                                }}
                                            />
                                        </div>

                                        {/* Suggestions popup */}
                                        {subjOpen && filteredSubj.length > 0 && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 5px)',
                                                    insetInlineStart: 0,
                                                    insetInlineEnd: 0,
                                                    background: '#fff',
                                                    border: '1.5px solid #e6ded2',
                                                    borderRadius: '16px',
                                                    zIndex: 20,
                                                    maxHeight: '220px',
                                                    overflow: 'auto',
                                                    padding: '5px',
                                                    boxShadow: '0 14px 34px rgba(42,38,35,.14)',
                                                    animation: 'pmccEnterA .2s both',
                                                }}
                                            >
                                                {filteredSubj.slice(0, 8).map((sPair, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onMouseDown={() => {
                                                            setData('subject', isRtl ? sPair[1] : sPair[0]);
                                                            setSubjOpen(false);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '2px',
                                                            width: '100%',
                                                            textAlign: 'start',
                                                            background: 'none',
                                                            border: 0,
                                                            borderRadius: '10px',
                                                            padding: '9px 12px',
                                                            font: 'inherit',
                                                            fontSize: '13.5px',
                                                            color: '#2a2623',
                                                            cursor: 'pointer',
                                                            transition: 'background .16s',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#fdf3e0'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                    >
                                                        <span style={{ fontWeight: 600, color: '#344e41' }}>
                                                            {isRtl ? sPair[1] : sPair[0]}
                                                        </span>
                                                        <span style={{ fontSize: '11.5px', color: '#8b847d' }}>
                                                            {isRtl ? sPair[0] : sPair[1]}
                                                        </span>
                                                    </button>
                                                ))}
                                                <div style={{ padding: '8px 12px', fontSize: '11.5px', color: '#8b847d' }}>
                                                    {label('No match? Keep typing — your own wording is accepted.', 'کوئی تجویز موزوں نہیں؟ اپنے الفاظ میں لکھتے رہیں، وہ بھی قبول ہے۔')}
                                                </div>
                                            </div>
                                        )}

                                        {errors.subject && (
                                            <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>
                                                {errors.subject}
                                            </span>
                                        )}
                                    </div>

                                    {/* What happened (Details) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                                            <label style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                                {label('What happened', 'کیا ہوا')} <span style={{ color: '#ec3013' }}>*</span>
                                            </label>
                                            <span style={{ fontSize: '11.5px', color: data.details.length >= 20 ? '#344e41' : '#8b847d' }}>
                                                {data.details.length} {label('characters', 'حروف')} (min 20)
                                            </span>
                                        </div>
                                        <textarea
                                            rows={4}
                                            className="pmcc-input"
                                            value={data.details}
                                            onChange={e => {
                                                setData('details', e.target.value);
                                                if (errors.details && e.target.value.trim().length >= 20) clearErrors('details');
                                            }}
                                            placeholder={label(
                                                'Describe the problem, when it started, and who you have already contacted.',
                                                'مسئلہ، اس کا آغاز اور اب تک آپ نے کس سے رابطہ کیا — تفصیل سے لکھیں۔'
                                            )}
                                            style={{
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                background: '#faf7f2',
                                                border: `1.5px solid ${errors.details ? '#ec3013' : '#e6ded2'}`,
                                                borderRadius: '13px',
                                                font: 'inherit',
                                                fontSize: '14px',
                                                lineHeight: 1.6,
                                                padding: '10px 14px',
                                                color: '#2a2623',
                                                outline: 'none',
                                                resize: 'vertical',
                                                transition: 'border-color .2s, box-shadow .2s, background .2s',
                                            }}
                                        />
                                        {errors.details && (
                                            <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>
                                                {errors.details}
                                            </span>
                                        )}
                                    </div>

                                    {/* Evidence (Attachments) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>
                                            {label('Evidence', 'ثبوت')} <span style={{ color: '#a9a29b', fontWeight: 500 }}>{label('(optional)', '(اختیاری)')}</span>
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                                            {/* File upload tile */}
                                            <label
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    background: '#faf7f2',
                                                    border: '1.5px dashed #ddd3c4',
                                                    borderRadius: '13px',
                                                    padding: '11px 14px',
                                                    cursor: 'pointer',
                                                    transition: 'border-color .2s, background .2s, transform .2s',
                                                }}
                                            >
                                                <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eaf1eb', display: 'grid', placeItems: 'center', flex: 'none' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#344e41" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21.5 12.5 12 22a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8.5-8.5" />
                                                    </svg>
                                                </span>
                                                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <span style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>{label('Attach files', 'فائلیں منسلک کریں')}</span>
                                                    <span style={{ fontSize: '11px', color: '#8b847d' }}>{label('Photos, video, PDF', 'تصاویر، ویڈیو، پی ڈی ایف')}</span>
                                                </span>
                                            </label>

                                            {/* Take Photo tile */}
                                            <label
                                                onClick={() => openCamera('photo')}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    background: '#faf7f2',
                                                    border: '1.5px dashed #ddd3c4',
                                                    borderRadius: '13px',
                                                    padding: '11px 14px',
                                                    cursor: 'pointer',
                                                    transition: 'border-color .2s, background .2s, transform .2s',
                                                }}
                                            >
                                                <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eaf1eb', display: 'grid', placeItems: 'center', flex: 'none' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#344e41" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 8h3l2-3h8l2 3h3v12H3z" /><circle cx="12" cy="13" r="4" />
                                                    </svg>
                                                </span>
                                                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <span style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>{label('Capture photo', 'تصویر لیں')}</span>
                                                    <span style={{ fontSize: '11px', color: '#8b847d' }}>{label('Use your camera', 'کیمرہ استعمال کریں')}</span>
                                                </span>
                                            </label>

                                            {/* Record Video tile */}
                                            <label
                                                onClick={() => openCamera('video')}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    background: '#faf7f2',
                                                    border: '1.5px dashed #ddd3c4',
                                                    borderRadius: '13px',
                                                    padding: '11px 14px',
                                                    cursor: 'pointer',
                                                    transition: 'border-color .2s, background .2s, transform .2s',
                                                }}
                                            >
                                                <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eaf1eb', display: 'grid', placeItems: 'center', flex: 'none' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#344e41" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M2.5 6.5h12v11h-12z" /><path d="m14.5 10.5 7-4v12l-7-4" />
                                                    </svg>
                                                </span>
                                                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <span style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont }}>{label('Capture video', 'ویڈیو بنائیں')}</span>
                                                    <span style={{ fontSize: '11px', color: '#8b847d' }}>{label('Record on the spot', 'موقع پر ریکارڈ کریں')}</span>
                                                </span>
                                            </label>
                                        </div>

                                        {/* Attached files pills */}
                                        {attachmentFiles.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                                                {attachmentFiles.map((f, idx) => (
                                                    <span
                                                        key={idx}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            background: '#eaf1eb',
                                                            borderRadius: '999px',
                                                            padding: '7px 12px',
                                                            fontSize: '12px',
                                                            color: '#344e41',
                                                            animation: 'pmccEnterA .25s both',
                                                        }}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#344e41" strokeWidth="2.4" strokeLinecap="round">
                                                            <path d="M20 6 9 17l-5-5" />
                                                        </svg>
                                                        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                                        <span style={{ color: '#6f8c79', fontSize: '11px' }}>{(f.size / 1024 < 1024) ? `${Math.round(f.size / 1024)} KB` : `${(f.size / 1048576).toFixed(1)} MB`}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(idx)}
                                                            style={{ background: 'none', border: 0, padding: 0, margin: 0, cursor: 'pointer', color: '#6f8c79', display: 'flex' }}
                                                        >
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {fileError && <span style={{ fontSize: '12px', color: '#ec3013' }}>{fileError}</span>}
                                    </div>
                                </div>
                            )}

                            {/* ═════════════════════════════════════
                                STEP 4: REVIEW AND SUBMIT
                                ═════════════════════════════════════ */}
                            {currentStep === 4 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {/* Review group: About you */}
                                    <div style={{ background: '#faf7f2', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e6ded2' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 14px' }}>
                                            <span style={{ fontFamily: uiFont, fontWeight: 700, fontSize: '13.5px', color: '#344e41' }}>{label('About you', 'آپ کے بارے میں')}</span>
                                            <button
                                                type="button"
                                                onClick={() => goTo(1)}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #e6ded2',
                                                    borderRadius: '999px',
                                                    padding: '5px 12px',
                                                    font: 'inherit',
                                                    fontSize: '11.5px',
                                                    fontWeight: 700,
                                                    color: '#ec3013',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {label('Edit', 'ترمیم')}
                                            </button>
                                        </div>
                                        <div style={{ background: '#fff', margin: '0 4px 4px', borderRadius: '13px', padding: '2px 0' }}>
                                            {[
                                                [label('Full name', 'پورا نام'), data.name || '—'],
                                                [label('CNIC number', 'قومی شناختی کارڈ نمبر'), data.cnic || '—'],
                                                [label('Mobile number', 'موبائل نمبر'), data.mobile_number || '—'],
                                                [label('Gender', 'جنس'), data.gender === 'male' ? label('Male', 'مرد') : data.gender === 'female' ? label('Female', 'عورت') : label('Prefer not to say', 'بتانا نہیں چاہتے')],
                                            ].map(([k, v]) => (
                                                <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 160px) 1fr', gap: '12px', padding: '8px 12px', fontSize: '13px' }}>
                                                    <span style={{ color: '#6b645e' }}>{k}</span>
                                                    <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Review group: Location */}
                                    <div style={{ background: '#faf7f2', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e6ded2' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 14px' }}>
                                            <span style={{ fontFamily: uiFont, fontWeight: 700, fontSize: '13.5px', color: '#344e41' }}>{label('Location', 'مقام')}</span>
                                            <button
                                                type="button"
                                                onClick={() => goTo(2)}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #e6ded2',
                                                    borderRadius: '999px',
                                                    padding: '5px 12px',
                                                    font: 'inherit',
                                                    fontSize: '11.5px',
                                                    fontWeight: 700,
                                                    color: '#ec3013',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {label('Edit', 'ترمیم')}
                                            </button>
                                        </div>
                                        <div style={{ background: '#fff', margin: '0 4px 4px', borderRadius: '13px', padding: '2px 0' }}>
                                            {[
                                                [label('District', 'ضلع'), districtName],
                                                [label('Tehsil', 'تحصیل'), tehsilName],
                                            ].map(([k, v]) => (
                                                <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 160px) 1fr', gap: '12px', padding: '8px 12px', fontSize: '13px' }}>
                                                    <span style={{ color: '#6b645e' }}>{k}</span>
                                                    <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Review group: Complaint */}
                                    <div style={{ background: '#faf7f2', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e6ded2' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 14px' }}>
                                            <span style={{ fontFamily: uiFont, fontWeight: 700, fontSize: '13.5px', color: '#344e41' }}>{label('Complaint', 'شکایت')}</span>
                                            <button
                                                type="button"
                                                onClick={() => goTo(3)}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #e6ded2',
                                                    borderRadius: '999px',
                                                    padding: '5px 12px',
                                                    font: 'inherit',
                                                    fontSize: '11.5px',
                                                    fontWeight: 700,
                                                    color: '#ec3013',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {label('Edit', 'ترمیم')}
                                            </button>
                                        </div>
                                        <div style={{ background: '#fff', margin: '0 4px 4px', borderRadius: '13px', padding: '2px 0' }}>
                                            {[
                                                [label('Department', 'محکمہ'), departmentName],
                                                ...(categoryName !== '—' ? [[label('Category', 'زمرہ'), categoryName]] : []),
                                                [label('Subject', 'موضوع'), data.subject || '—'],
                                                [label('What happened', 'کیا ہوا'), data.details || '—'],
                                                ...(attachmentFiles.length > 0 ? [[label('Evidence', 'ثبوت'), `${attachmentFiles.length} ${label('file(s)', 'فائلیں')}`]] : []),
                                            ].map(([k, v]) => (
                                                <div key={k} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 160px) 1fr', gap: '12px', padding: '8px 12px', fontSize: '13px' }}>
                                                    <span style={{ color: '#6b645e' }}>{k}</span>
                                                    <span style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Consent Checkbox */}
                                    <label
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '11px',
                                            background: '#fdf3e0',
                                            borderRadius: '13px',
                                            padding: '12px 14px',
                                            cursor: 'pointer',
                                            border: '1px solid #ebd9b8',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={declarationAccepted}
                                            onChange={e => {
                                                setDeclarationAccepted(e.target.checked);
                                                if (errors.declaration) clearErrors('declaration');
                                            }}
                                            style={{ width: '17px', height: '17px', margin: '2px 0 0', accentColor: '#344e41', flex: 'none', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '12.5px', color: '#5c4713', lineHeight: 1.5 }}>
                                            {label(
                                                'I confirm the information above is true to the best of my knowledge, and I allow PMCC to share it with the relevant department.',
                                                'میں تصدیق کرتا/کرتی ہوں کہ درج بالا معلومات میرے علم کے مطابق درست ہیں، اور PMCC انہیں متعلقہ محکمے کو بھیج سکتا ہے۔'
                                            )}
                                        </span>
                                    </label>
                                    {errors.declaration && (
                                        <span className="animate-pmcc-shake" style={{ fontSize: '12px', color: '#ec3013' }}>
                                            {errors.declaration}
                                        </span>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Bottom Footer Actions */}
                        <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#6b645e' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#344e41" strokeWidth="1.9" strokeLinecap="round">
                                    <rect x="4" y="10" width="16" height="10" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                </svg>
                                <span>{label('Your information is kept safe and confidential.', 'آپ کی معلومات مکمل طور پر محفوظ اور رازدارانہ رکھی جائیں گی۔')}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        style={{
                                            background: '#faf7f2',
                                            color: '#344e41',
                                            border: '1.5px solid #e6ded2',
                                            borderRadius: '999px',
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            padding: '9px 18px',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'background .2s, transform .2s',
                                        }}
                                    >
                                        <span>{isRtl ? '→' : '←'}</span>
                                        <span>{label('Back', 'پیچھے')}</span>
                                    </button>
                                )}

                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        style={{
                                            background: '#ec3013',
                                            color: '#fff',
                                            border: 0,
                                            borderRadius: '999px',
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 700,
                                            fontSize: '13.5px',
                                            padding: '11px 22px',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 6px 16px rgba(236,48,19,.24)',
                                            transition: 'transform .2s cubic-bezier(.2,.8,.2,1), box-shadow .2s',
                                        }}
                                    >
                                        <span>{label('Next step', 'اگلا مرحلہ')}</span>
                                        <span style={{ fontSize: '15px' }}>{isRtl ? '←' : '→'}</span>
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        style={{
                                            background: '#ec3013',
                                            color: '#fff',
                                            border: 0,
                                            borderRadius: '999px',
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 700,
                                            fontSize: '13.5px',
                                            padding: '11px 22px',
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                            opacity: processing ? 0.75 : 1,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 6px 16px rgba(236,48,19,.24)',
                                            transition: 'transform .2s cubic-bezier(.2,.8,.2,1), box-shadow .2s',
                                        }}
                                    >
                                        <span>{processing ? label('Submitting...', 'جمع ہو رہا ہے...') : label('Submit complaint', 'شکایت جمع کروائیں')}</span>
                                        <span style={{ fontSize: '15px' }}>✓</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </PublicLayout>
    );
}
