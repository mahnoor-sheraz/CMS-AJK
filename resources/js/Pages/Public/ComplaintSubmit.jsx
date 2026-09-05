import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';

export default function ComplaintSubmit({ districts: rawDistricts = [], departments: rawDepartments = [] }) {
    const { lang, t } = useLanguage();
    const isRtl = lang === 'ur';

    const districts = useMemo(() => {
        if (Array.isArray(rawDistricts)) return rawDistricts;
        return Object.values(rawDistricts || {});
    }, [rawDistricts]);

    const departments = useMemo(() => {
        if (Array.isArray(rawDepartments)) return rawDepartments;
        return Object.values(rawDepartments || {});
    }, [rawDepartments]);

    // Current wizard step (1: Your Details, 2: Location, 3: Complaint, 4: Attachments & Review)
    const [currentStep, setCurrentStep] = useState(1);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: '',
        cnic: '',
        mobile_number: '',
        gender: '',
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

    // In-browser Camera & Video Capture State
    const [cameraModalOpen, setCameraModalOpen] = useState(false);
    const [captureMode, setCaptureMode] = useState('photo'); // 'photo' | 'video'
    const [cameraError, setCameraError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTimeLeft, setRecordingTimeLeft] = useState(60);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const timerIntervalRef = useRef(null);

    // Native file inputs for direct camera fallback
    const nativePhotoInputRef = useRef(null);
    const nativeVideoInputRef = useRef(null);
    const fileUploadInputRef = useRef(null);

    // Filter Tehsils based on selected District
    const availableTehsils = useMemo(() => {
        if (!data.district_id) return [];
        const selectedDistrict = districts.find((d) => String(d.id) === String(data.district_id));
        if (!selectedDistrict) return [];
        const tehsils = selectedDistrict.tehsils;
        return Array.isArray(tehsils) ? tehsils : Object.values(tehsils || {});
    }, [data.district_id, districts]);

    // Filter Sub-Departments and Categories based on selected Department
    const selectedDeptObj = useMemo(() => {
        if (!data.department_id || data.department_id === 'other') return null;
        return departments.find((d) => String(d.id) === String(data.department_id));
    }, [data.department_id, departments]);

    const availableSubDepartments = useMemo(() => {
        if (!selectedDeptObj) return [];
        const subs = selectedDeptObj.sub_departments || selectedDeptObj.subDepartments || [];
        return Array.isArray(subs) ? subs : Object.values(subs || {});
    }, [selectedDeptObj]);

    const availableCategories = useMemo(() => {
        if (!selectedDeptObj) return [];
        const cats = selectedDeptObj.categories || [];
        return Array.isArray(cats) ? cats : Object.values(cats || {});
    }, [selectedDeptObj]);

    // Filter Sub-Categories based on selected Category
    const selectedCategoryObj = useMemo(() => {
        if (!data.category_id || data.category_id === 'other') return null;
        return availableCategories.find((c) => String(c.id) === String(data.category_id));
    }, [data.category_id, availableCategories]);

    const availableSubCategories = useMemo(() => {
        if (!selectedCategoryObj) return [];
        const subCats = selectedCategoryObj.sub_categories || selectedCategoryObj.subCategories || [];
        return Array.isArray(subCats) ? subCats : Object.values(subCats || {});
    }, [selectedCategoryObj]);

    // Clean up camera stream on unmount
    useEffect(() => {
        return () => {
            stopCameraStream();
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    const stopCameraStream = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

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

    // Add files to attachments state with validation
    const addAttachments = (newFiles) => {
        setFileError('');
        const combined = [...attachmentFiles, ...newFiles];

        if (combined.length > 5) {
            setFileError(`[ERR_FILE_COUNT_EXCEEDED] ${t('valFilesMaxCount')}`);
            return false;
        }

        for (let file of newFiles) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setFileError(`[ERR_FILE_SIZE_EXCEEDED] ${t('valFileMaxSize')}`);
                return false;
            }
        }

        setAttachmentFiles(combined);
        setData('attachments', combined);
        return true;
    };

    // Remove single attachment
    const removeAttachment = (indexToRemove) => {
        const updated = attachmentFiles.filter((_, idx) => idx !== indexToRemove);
        setAttachmentFiles(updated);
        setData('attachments', updated);
    };

    // Handle file input change
    const handleFileChange = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);
        addAttachments(files);
        e.target.value = '';
    };

    // Open Camera Modal
    const openCameraModal = async (mode = 'photo') => {
        setCaptureMode(mode);
        setCameraError('');
        setCameraModalOpen(true);
        setIsRecording(false);
        setRecordingTimeLeft(60);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('MediaDevices not supported');
            }

            const constraints = {
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: mode === 'video',
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            mediaStreamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.warn('Camera stream error:', err);
            setCameraError(t('captureCameraDenied'));
            stopCameraStream();
        }
    };

    // Close Camera Modal
    const closeCameraModal = () => {
        if (isRecording) stopVideoRecording();
        stopCameraStream();
        setCameraModalOpen(false);
        setCameraError('');
    };

    // Capture Snapshot Photo
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const photoFile = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                addAttachments([photoFile]);
                closeCameraModal();
            }
        }, 'image/jpeg', 0.85);
    };

    // Start Video Recording
    const startVideoRecording = () => {
        if (!mediaStreamRef.current) return;

        recordedChunksRef.current = [];
        try {
            const recorder = new MediaRecorder(mediaStreamRef.current);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const videoFile = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
                addAttachments([videoFile]);
                closeCameraModal();
            };

            recorder.start(1000); // 1-sec chunks
            setIsRecording(true);
            setRecordingTimeLeft(60);

            // 60-second countdown
            let time = 60;
            timerIntervalRef.current = setInterval(() => {
                time -= 1;
                setRecordingTimeLeft(time);
                if (time <= 0) {
                    clearInterval(timerIntervalRef.current);
                    stopVideoRecording();
                }
            }, 1000);
        } catch (err) {
            console.warn('Video recorder error:', err);
            setCameraError(t('captureCameraDenied'));
        }
    };

    // Stop Video Recording
    const stopVideoRecording = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    // Step-by-Step Validation Function
    const validateStep = (step) => {
        clearErrors();
        let isValid = true;

        if (step === 1) {
            if (!data.name.trim()) {
                setError('name', t('valNameReq'));
                isValid = false;
            }

            const cleanCnic = data.cnic.replace(/[^0-9]/g, '');
            if (!cleanCnic) {
                setError('cnic', t('valCnicReq'));
                isValid = false;
            } else if (cleanCnic.length !== 13) {
                setError('cnic', t('valCnicFormat'));
                isValid = false;
            }

            const cleanMobile = data.mobile_number.replace(/[^0-9]/g, '');
            if (!cleanMobile) {
                setError('mobile_number', t('valMobileReq'));
                isValid = false;
            } else if (!/^(03|\+?923)[0-9]{9}$/.test(cleanMobile)) {
                setError('mobile_number', t('valMobileFormat'));
                isValid = false;
            }
        } else if (step === 2) {
            if (!data.district_id) {
                setError('district_id', t('valDistrictReq'));
                isValid = false;
            }

            if (!data.tehsil_id) {
                setError('tehsil_id', t('valTehsilReq'));
                isValid = false;
            }
        } else if (step === 3) {
            if (!data.department_id) {
                setError('department_id', t('valDepartmentReq'));
                isValid = false;
            }

            if (!data.subject.trim()) {
                setError('subject', t('valSubjectReq'));
                isValid = false;
            } else if (data.subject.length > 100) {
                setError('subject', t('valSubjectMax'));
                isValid = false;
            }

            if (!data.details.trim()) {
                setError('details', t('valDetailsReq'));
                isValid = false;
            } else if (data.details.trim().length < 50) {
                setError('details', t('valDetailsMin'));
                isValid = false;
            }
        }

        if (!isValid) {
            setTimeout(() => {
                const firstError = document.querySelector('.border-red-500, .border-amber-500, text-red-600');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus?.();
                }
            }, 60);
        }

        return isValid;
    };

    // Step Navigation Handlers
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step) => {
        // Can always jump back to earlier steps
        if (step < currentStep) {
            setCurrentStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // To jump forward, ensure all intermediate steps are valid
        for (let s = currentStep; s < step; s++) {
            if (!validateStep(s)) {
                return;
            }
        }
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Final Submission from Step 4
    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        // Validate all 3 previous steps just in case
        if (!validateStep(1)) {
            setCurrentStep(1);
            return;
        }
        if (!validateStep(2)) {
            setCurrentStep(2);
            return;
        }
        if (!validateStep(3)) {
            setCurrentStep(3);
            return;
        }

        // Submit form via Inertia POST
        post('/complaints', {
            forceFormData: true,
            onError: (errs) => {
                // If backend validation fails on earlier step, jump to it
                if (errs.name || errs.cnic || errs.mobile_number || errs.gender) {
                    setCurrentStep(1);
                } else if (errs.district_id || errs.tehsil_id) {
                    setCurrentStep(2);
                } else if (errs.department_id || errs.sub_department_id || errs.category_id || errs.sub_category_id || errs.subject || errs.details) {
                    setCurrentStep(3);
                }

                setTimeout(() => {
                    const firstError = document.querySelector('.border-red-500, .border-amber-500, .animate-shake');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus?.();
                    }
                }, 60);
            },
        });
    };

    // Step configuration array
    const steps = [
        { id: 1, title: t('step1Title'), short: t('step1Short'), desc: t('step1Desc') },
        { id: 2, title: t('step2Title'), short: t('step2Short'), desc: t('step2Desc') },
        { id: 3, title: t('step3Title'), short: t('step3Short'), desc: t('step3Desc') },
        { id: 4, title: t('step4Title'), short: t('step4Short'), desc: t('step4Desc') },
    ];

    const currentStepConfig = steps.find((s) => s.id === currentStep) || steps[0];

    // Helper for review summary labels
    const selectedDistrictName = useMemo(() => {
        const d = districts.find((item) => String(item.id) === String(data.district_id));
        if (!d) return '';
        return lang === 'ur' ? d.name_ur || d.name : d.name;
    }, [data.district_id, districts, lang]);

    const selectedTehsilName = useMemo(() => {
        const tItem = availableTehsils.find((item) => String(item.id) === String(data.tehsil_id));
        if (!tItem) return '';
        return lang === 'ur' ? tItem.name_ur || tItem.name : tItem.name;
    }, [data.tehsil_id, availableTehsils, lang]);

    const selectedDepartmentName = useMemo(() => {
        if (data.department_id === 'other') return t('optOther');
        const dept = departments.find((item) => String(item.id) === String(data.department_id));
        if (!dept) return '';
        return lang === 'ur' ? dept.name_ur || dept.name : dept.name;
    }, [data.department_id, departments, lang, t]);

    const selectedSubDepartmentName = useMemo(() => {
        if (!data.sub_department_id) return t('reviewSubDeptNone');
        const sd = availableSubDepartments.find((item) => String(item.id) === String(data.sub_department_id));
        if (!sd) return t('reviewSubDeptNone');
        return lang === 'ur' ? sd.name_ur || sd.name : sd.name;
    }, [data.sub_department_id, availableSubDepartments, lang, t]);

    const selectedCategoryName = useMemo(() => {
        if (!data.category_id || data.category_id === 'other') return data.category_id === 'other' ? t('optOther') : '';
        const cat = availableCategories.find((item) => String(item.id) === String(data.category_id));
        if (!cat) return '';
        return lang === 'ur' ? cat.name_ur || cat.name : cat.name;
    }, [data.category_id, availableCategories, lang, t]);

    const selectedSubCategoryName = useMemo(() => {
        if (!data.sub_category_id) return t('reviewSubCatNone');
        const sc = availableSubCategories.find((item) => String(item.id) === String(data.sub_category_id));
        if (!sc) return t('reviewSubCatNone');
        return lang === 'ur' ? sc.name_ur || sc.name : sc.name;
    }, [data.sub_category_id, availableSubCategories, lang, t]);

    return (
        <PublicLayout>
            <Head title={t('submitTitle')} />

            {/* Hidden canvas for taking snapshot photo */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden native inputs for direct device camera capture fallback */}
            <input
                ref={nativePhotoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
            />
            <input
                ref={nativeVideoInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
            />
            <input
                ref={fileUploadInputRef}
                type="file"
                multiple
                accept="image/*,audio/*,video/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header Banner with AJK Badge */}
            <div className="mb-6 text-center max-w-3xl mx-auto">
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

            {/* 4-STEP WIZARD PROGRESS INDICATOR (Visually Distinct Segmented Pill Design) */}
            <div className="max-w-3xl mx-auto mb-8 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-900/10">
                {/* Active Step Status Label */}
                <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-[#034d28] text-amber-300 ring-2 ring-amber-400/60 shadow-xs">
                            {lang === 'ur'
                                ? `مرحلہ ${currentStep} از 4`
                                : `Step ${currentStep} of 4`}
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                            {currentStepConfig.title}
                        </h2>
                    </div>
                    <span className="text-xs text-slate-500 hidden sm:inline-block">
                        {currentStepConfig.desc}
                    </span>
                </div>

                {/* Segmented Step Pills (Mirrored in RTL) */}
                <div className={`grid grid-cols-4 gap-2 sm:gap-3 ${isRtl ? 'direction-rtl' : ''}`}>
                    {steps.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isCurrent = step.id === currentStep;

                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => goToStep(step.id)}
                                disabled={step.id > currentStep}
                                className={`group relative flex flex-col sm:flex-row items-center sm:items-start gap-2 p-2.5 sm:p-3 rounded-xl transition-all text-left ${
                                    isCurrent
                                        ? 'bg-gradient-to-br from-emerald-50 via-amber-50/40 to-emerald-50 border-2 border-[#046A38] ring-3 ring-amber-400/40 shadow-sm'
                                        : isCompleted
                                        ? 'bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/80 cursor-pointer'
                                        : 'bg-slate-50/90 border border-slate-200/80 opacity-70 cursor-not-allowed'
                                }`}
                            >
                                {/* Step Badge */}
                                <div
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-transform ${
                                        isCurrent
                                            ? 'bg-[#034d28] text-amber-300 shadow-sm scale-105'
                                            : isCompleted
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-slate-200 text-slate-600'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span>{step.id}</span>
                                    )}
                                </div>

                                {/* Step Text */}
                                <div className="hidden sm:block truncate min-w-0">
                                    <span
                                        className={`text-xs font-bold block truncate ${
                                            isCurrent ? 'text-emerald-950 font-black' : isCompleted ? 'text-emerald-900' : 'text-slate-600'
                                        }`}
                                    >
                                        {step.short}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">
                                        {isCompleted ? (lang === 'ur' ? 'مکمل' : 'Done') : isCurrent ? (lang === 'ur' ? 'جاری' : 'Active') : ''}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error Banners */}
            {errors.general && (
                <div className="mb-6 max-w-3xl mx-auto relative overflow-hidden bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border-2 border-red-400 text-red-950 p-5 rounded-2xl shadow-md flex items-start gap-4 animate-shake">
                    <div className="p-2.5 bg-red-500 text-white rounded-xl shrink-0 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-1 flex-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black bg-red-200 text-red-900 border border-red-300 inline-block">
                            {errors.error_code || 'ERR_SUBMISSION_FAILED'}
                        </span>
                        <p className="text-sm font-semibold text-red-900 leading-relaxed pt-1">
                            {errors.general}
                        </p>
                    </div>
                </div>
            )}

            {errors.rate_limit && (
                <div className="mb-6 max-w-3xl mx-auto p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-3 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="space-y-1 text-sm">
                        <h4 className="font-bold text-amber-950">{t('valRateLimitTitle')}</h4>
                        <p>{t('valRateLimitRecent', { time: errors.rate_limit })}</p>
                    </div>
                </div>
            )}

            {/* FORM BODY CONTAINER */}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                {/* ========================================================================= */}
                {/* STEP 1: YOUR DETAILS */}
                {/* ========================================================================= */}
                {currentStep === 1 && (
                    <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500 animate-fade-in">
                        <h2 className="text-lg font-bold text-emerald-950 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-[#034d28] text-amber-300 ring-2 ring-amber-400/80 flex items-center justify-center text-xs font-black shadow-sm">1</span>
                            {t('sectionPersonal')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                    {t('labelName')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    maxLength={100}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t('placeholderName')}
                                    className={`w-full h-12 rounded-xl border px-4 text-base transition-all focus:outline-none focus:ring-2 ${
                                        errors.name ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                    }`}
                                />
                                {errors.name && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>}
                            </div>

                            {/* CNIC */}
                            <div>
                                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                    {t('labelCnic')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    dir="ltr"
                                    value={data.cnic}
                                    maxLength={13}
                                    onChange={(e) => setData('cnic', e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder={t('placeholderCnic')}
                                    className={`w-full h-12 rounded-xl border px-4 text-base transition-all focus:outline-none focus:ring-2 ${
                                        errors.cnic ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                    }`}
                                />
                                {errors.cnic && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.cnic}</p>}
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                    {t('labelMobile')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    dir="ltr"
                                    value={data.mobile_number}
                                    maxLength={11}
                                    onChange={(e) => setData('mobile_number', e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder={t('placeholderMobile')}
                                    className={`w-full h-12 rounded-xl border px-4 text-base transition-all focus:outline-none focus:ring-2 ${
                                        errors.mobile_number ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                    }`}
                                />
                                {errors.mobile_number && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.mobile_number}</p>}
                            </div>

                            {/* Gender (Optional) */}
                            <div>
                                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                    {t('labelGender')}
                                </label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className={`w-full h-12 rounded-xl border px-4 text-base transition-all focus:outline-none focus:ring-2 ${
                                        errors.gender ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-400'
                                    }`}
                                >
                                    <option value="">{t('selectGender')}</option>
                                    <option value="male">{t('optMale')}</option>
                                    <option value="female">{t('optFemale')}</option>
                                </select>
                                {errors.gender && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.gender}</p>}
                            </div>
                        </div>

                        {/* Step 1 Footer Navigation */}
                        <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full sm:w-auto px-8 py-3.5 bg-[#034d28] hover:bg-[#023b1f] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all border-b-4 border-amber-500 flex items-center justify-center gap-2"
                            >
                                <span>{t('btnNext')}</span>
                                <span className={isRtl ? 'rotate-180' : ''}>→</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* STEP 2: LOCATION */}
                {/* ========================================================================= */}
                {currentStep === 2 && (
                    <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500 animate-fade-in">
                        <h2 className="text-lg font-bold text-emerald-950 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-[#034d28] text-amber-300 ring-2 ring-amber-400/80 flex items-center justify-center text-xs font-black shadow-sm">2</span>
                            {t('step2Title')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* District */}
                            <div>
                                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                    {t('labelDistrict')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.district_id}
                                    onChange={handleDistrictChange}
                                    className={`w-full h-12 rounded-xl border px-4 text-base transition-all focus:outline-none focus:ring-2 ${
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
                                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                    {t('labelTehsil')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.tehsil_id}
                                    onChange={(e) => setData('tehsil_id', e.target.value)}
                                    disabled={!data.district_id}
                                    className={`w-full h-12 rounded-xl border px-4 text-base transition-all focus:outline-none focus:ring-2 ${
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

                        {/* Step 2 Footer Navigation */}
                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base rounded-xl transition-all flex items-center gap-2"
                            >
                                <span className={isRtl ? 'rotate-180' : ''}>←</span>
                                <span>{t('btnBack')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-8 py-3.5 bg-[#034d28] hover:bg-[#023b1f] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all border-b-4 border-amber-500 flex items-center gap-2"
                            >
                                <span>{t('btnNext')}</span>
                                <span className={isRtl ? 'rotate-180' : ''}>→</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* STEP 3: COMPLAINT */}
                {/* ========================================================================= */}
                {currentStep === 3 && (
                    <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500 animate-fade-in space-y-6">
                        <h2 className="text-lg font-bold text-emerald-950 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-[#034d28] text-amber-300 ring-2 ring-amber-400/80 flex items-center justify-center text-xs font-black shadow-sm">3</span>
                            {t('step3Title')}
                        </h2>

                        {/* Department & Categorization */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Department */}
                            <div>
                                <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                    {t('labelDepartment')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.department_id}
                                    onChange={handleDepartmentChange}
                                    className={`w-full h-12 rounded-xl border px-4 text-base transition-all focus:outline-none focus:ring-2 ${
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

                            {/* Sub-Department */}
                            {data.department_id && data.department_id !== 'other' && availableSubDepartments.length > 0 && (
                                <div>
                                    <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                        {t('labelSubDepartment')}
                                    </label>
                                    <select
                                        value={data.sub_department_id}
                                        onChange={(e) => setData('sub_department_id', e.target.value)}
                                        className="w-full h-12 rounded-xl border border-slate-300 px-4 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
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

                            {/* Category */}
                            {data.department_id && data.department_id !== 'other' && (
                                <div>
                                    <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                        {t('labelCategory')}
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={handleCategoryChange}
                                        className="w-full h-12 rounded-xl border border-slate-300 px-4 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
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

                            {/* Sub-Category */}
                            {data.category_id && data.category_id !== 'other' && availableSubCategories.length > 0 && (
                                <div>
                                    <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                        {t('labelSubCategory')}
                                    </label>
                                    <select
                                        value={data.sub_category_id}
                                        onChange={(e) => setData('sub_category_id', e.target.value)}
                                        className="w-full h-12 rounded-xl border border-slate-300 px-4 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
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

                        {/* Subject */}
                        <div>
                            <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                {t('labelSubject')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.subject}
                                maxLength={100}
                                onChange={(e) => setData('subject', e.target.value)}
                                placeholder={t('placeholderSubject')}
                                className={`w-full h-12 rounded-xl border px-4 text-base transition-all focus:outline-none focus:ring-2 ${
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
                            <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                                {t('labelDetails')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={6}
                                value={data.details}
                                onChange={(e) => setData('details', e.target.value)}
                                placeholder={t('placeholderDetails')}
                                className={`w-full rounded-xl border px-4 py-3.5 min-h-[140px] text-base leading-relaxed transition-all focus:outline-none focus:ring-2 ${
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

                        {/* Step 3 Footer Navigation */}
                        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base rounded-xl transition-all flex items-center gap-2"
                            >
                                <span className={isRtl ? 'rotate-180' : ''}>←</span>
                                <span>{t('btnBack')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-8 py-3.5 bg-[#034d28] hover:bg-[#023b1f] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all border-b-4 border-amber-500 flex items-center gap-2"
                            >
                                <span>{t('btnNext')}</span>
                                <span className={isRtl ? 'rotate-180' : ''}>→</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* STEP 4: ATTACHMENTS & REVIEW */}
                {/* ========================================================================= */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-fade-in">
                        {/* 4A: Attachments & Media Capture */}
                        <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500">
                            <h2 className="text-lg font-bold text-emerald-950 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-full bg-[#034d28] text-amber-300 ring-2 ring-amber-400/80 flex items-center justify-center text-xs font-black shadow-sm">4</span>
                                {t('sectionAttachments')}
                            </h2>

                            <p className="text-xs text-slate-500 mb-4">{t('attachmentsHint')}</p>

                            {/* Capture Options Bar (Upload File, Take a Photo, Record a Video) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                {/* Option 1: Choose File */}
                                <button
                                    type="button"
                                    onClick={() => fileUploadInputRef.current?.click()}
                                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-all flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm shadow-xs"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span>{t('captureChooseFile')}</span>
                                </button>

                                {/* Option 2: Take a Photo */}
                                <button
                                    type="button"
                                    onClick={() => openCameraModal('photo')}
                                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-all flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm shadow-xs"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{t('captureTakePhoto')}</span>
                                </button>

                                {/* Option 3: Record a Video (capped at 60s) */}
                                <button
                                    type="button"
                                    onClick={() => openCameraModal('video')}
                                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-all flex items-center justify-center gap-2.5 font-bold text-xs sm:text-sm shadow-xs"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>{t('captureRecordVideo')}</span>
                                </button>
                            </div>

                            {/* Camera Denied Warning Banner (if camera fails/denied) */}
                            {cameraError && (
                                <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div className="space-y-1">
                                        <p className="font-bold">{cameraError}</p>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => nativePhotoInputRef.current?.click()}
                                                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-semibold hover:bg-amber-100"
                                            >
                                                {t('captureTakePhoto')} (Device)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => nativeVideoInputRef.current?.click()}
                                                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-semibold hover:bg-amber-100"
                                            >
                                                {t('captureRecordVideo')} (Device)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* File Errors */}
                            {fileError && (
                                <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>{fileError}</span>
                                </div>
                            )}

                            {/* Attachment List */}
                            {attachmentFiles.length > 0 ? (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-semibold text-emerald-700">
                                        {t('filesSelected', { count: attachmentFiles.length })}
                                    </p>
                                    <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-xs">
                                        {attachmentFiles.map((file, idx) => (
                                            <li key={idx} className="px-4 py-2.5 flex justify-between items-center text-slate-700 hover:bg-slate-100/60">
                                                <div className="flex items-center gap-2 truncate max-w-sm sm:max-w-md">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                                    <span className="truncate font-medium">{file.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-slate-400 font-mono text-[11px]">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(idx)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                                                        title="Remove"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                                    {t('reviewNoAttachments')}
                                </div>
                            )}
                        </div>

                        {/* 4B: Read-Only Review Summary of Steps 1–3 */}
                        <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-black text-emerald-950">
                                    {t('reviewTitle')}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    {t('reviewSubtitle')}
                                </p>
                            </div>

                            {/* Section 1 Review: Citizen Information */}
                            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {t('reviewPersonal')}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => goToStep(1)}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg hover:bg-emerald-100/60 transition-colors"
                                    >
                                        ✏️ {t('btnEdit')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">{t('labelName')}:</span>
                                        <span className="font-bold text-slate-800">{data.name || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">{t('labelCnic')}:</span>
                                        <span className="font-mono font-bold text-slate-800">{data.cnic || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">{t('labelMobile')}:</span>
                                        <span className="font-mono font-bold text-slate-800">{data.mobile_number || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">{t('labelGender')}:</span>
                                        <span className="font-bold text-slate-800">
                                            {data.gender === 'male' ? t('optMale') : data.gender === 'female' ? t('optFemale') : t('reviewGenderNotSpecified')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 Review: Location Information */}
                            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {t('reviewLocation')}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => goToStep(2)}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg hover:bg-emerald-100/60 transition-colors"
                                    >
                                        ✏️ {t('btnEdit')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">{t('labelDistrict')}:</span>
                                        <span className="font-bold text-slate-800">{selectedDistrictName || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">{t('labelTehsil')}:</span>
                                        <span className="font-bold text-slate-800">{selectedTehsilName || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3 Review: Complaint Details */}
                            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {t('reviewComplaint')}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => goToStep(3)}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg hover:bg-emerald-100/60 transition-colors"
                                    >
                                        ✏️ {t('btnEdit')}
                                    </button>
                                </div>
                                <div className="space-y-3 text-xs sm:text-sm">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">{t('labelDepartment')}:</span>
                                            <span className="font-bold text-slate-800">{selectedDepartmentName || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">{t('labelSubDepartment')}:</span>
                                            <span className="font-semibold text-slate-700">{selectedSubDepartmentName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">{t('labelCategory')}:</span>
                                            <span className="font-semibold text-slate-700">{selectedCategoryName || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">{t('labelSubCategory')}:</span>
                                            <span className="font-semibold text-slate-700">{selectedSubCategoryName}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">{t('labelSubject')}:</span>
                                        <p className="font-bold text-emerald-950 mt-0.5">{data.subject || '—'}</p>
                                    </div>

                                    <div>
                                        <span className="text-slate-400 block text-[11px]">{t('labelDetails')}:</span>
                                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mt-0.5 bg-white p-3 rounded-lg border border-slate-200/80">
                                            {data.details || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 Footer Navigation & Final Submission */}
                        <div className="flex items-center justify-between gap-4 pt-2">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-3.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base rounded-xl transition-all flex items-center gap-2"
                            >
                                <span className={isRtl ? 'rotate-180' : ''}>←</span>
                                <span>{t('btnBack')}</span>
                            </button>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-10 py-4 bg-gradient-to-r from-[#034d28] via-[#046A38] to-[#034d28] hover:from-[#023b1f] hover:to-[#034d28] text-white font-extrabold text-base rounded-xl shadow-lg hover:shadow-xl transition-all border-b-4 border-amber-500 active:border-b-0 active:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2.5"
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
                    </div>
                )}
            </form>

            {/* IN-BROWSER CAMERA / VIDEO CAPTURE MODAL */}
            {cameraModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
                    <div className="relative w-full max-w-lg bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                        {/* Modal Header */}
                        <div className="p-4 bg-slate-800/90 flex justify-between items-center border-b border-slate-700">
                            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${captureMode === 'video' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`}></span>
                                <span>{captureMode === 'video' ? t('captureRecordVideo') : t('captureTakePhoto')}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={closeCameraModal}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Video Viewport */}
                        <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[450px] overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />

                            {/* Video Timer Pill (60s countdown) */}
                            {captureMode === 'video' && (
                                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2 border border-red-500/50">
                                    <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`}></span>
                                    <span>{isRecording ? t('captureTimeRemaining', { sec: recordingTimeLeft }) : t('captureMaxTimeNotice')}</span>
                                </div>
                            )}

                            {/* Permission error prompt inside viewport */}
                            {cameraError && (
                                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                                    <p className="text-xs sm:text-sm text-amber-300 font-semibold">{cameraError}</p>
                                    <button
                                        type="button"
                                        onClick={closeCameraModal}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold"
                                    >
                                        {t('captureClose')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Modal Action Controls */}
                        {!cameraError && (
                            <div className="p-4 bg-slate-800/90 flex items-center justify-between gap-3 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={closeCameraModal}
                                    className="px-4 py-2.5 text-xs text-slate-300 hover:text-white"
                                >
                                    {t('captureClose')}
                                </button>

                                {captureMode === 'photo' ? (
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-sm rounded-xl shadow-md flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        </svg>
                                        <span>{t('captureSnapPhoto')}</span>
                                    </button>
                                ) : (
                                    <>
                                        {!isRecording ? (
                                            <button
                                                type="button"
                                                onClick={startVideoRecording}
                                                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl shadow-md flex items-center gap-2"
                                            >
                                                <span className="w-3 h-3 rounded-full bg-white"></span>
                                                <span>{t('captureStartRecord')}</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={stopVideoRecording}
                                                className="px-6 py-2.5 bg-slate-100 hover:bg-white text-red-700 font-black text-sm rounded-xl shadow-md flex items-center gap-2 animate-pulse"
                                            >
                                                <span className="w-3 h-3 rounded-xs bg-red-600"></span>
                                                <span>{t('captureStopRecord')}</span>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
