import FocalPersonLayout from '@/Layouts/FocalPersonLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function FocalPersonDashboard({
    department = null,
    metrics = {},
    complaints = [],
    fieldOfficers = [],
    reassignmentRequests = [],
    categories = [],
    districts = [],
    tehsils = [],
    departments = [],
    filters = {},
}) {
    // Current Active Workspace Tab: 'dashboard' | 'list' | 'escalations' | 'reports' | 'notifications' | 'profile'
    const [currentTab, setCurrentTab] = useState('dashboard');
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Active Modal State: null | 'reassign' | 'escalate' | 'note'
    const [activeModal, setActiveModal] = useState(null);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // Reassignment Form
    const {
        data: reassignData,
        setData: setReassignData,
        post: postReassign,
        processing: reassignProcessing,
        errors: reassignErrors,
        reset: resetReassign,
    } = useForm({
        to_department_id: '',
        reason: '',
    });

    // Progress Note Form
    const {
        data: noteData,
        setData: setNoteData,
        post: postNote,
        processing: noteProcessing,
        reset: resetNote,
    } = useForm({
        notes: '',
    });

    // Escalation Form
    const {
        data: escalateData,
        setData: setEscalateData,
        post: postEscalate,
        processing: escalateProcessing,
        reset: resetEscalate,
    } = useForm({
        reason: 'Beyond departmental authority',
        notes: '',
    });

    const openModal = (type, complaint) => {
        setSelectedComplaint(complaint);
        setActiveModal(type);
        if (type === 'reassign') resetReassign();
        if (type === 'note') resetNote();
        if (type === 'escalate') resetEscalate();
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedComplaint(null);
    };

    const submitReassignment = (e) => {
        e.preventDefault();
        postReassign(route('fp.complaints.reassign', selectedComplaint.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const submitProgressNote = (e) => {
        e.preventDefault();
        postNote(route('fp.complaints.progress-note', selectedComplaint.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const submitEscalation = (e) => {
        e.preventDefault();
        // Uses progress-note to record administrative escalation per Module 4
        postNote(route('fp.complaints.progress-note', selectedComplaint.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    // Row Click Routing per PRD
    const handleComplaintClick = (complaint) => {
        if (complaint.stage === 'application_submission') {
            router.visit(route('fp.complaints.investigate', complaint.id));
        } else {
            router.visit(route('fp.complaints.resolve', complaint.id));
        }
    };

    // Client-side filtering across the dataset for instant feedback
    const filteredComplaints = complaints.filter((c) => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchNumber = c.complaint_number?.toLowerCase().includes(term);
            const matchSubject = c.subject?.toLowerCase().includes(term);
            const matchCitizen = c.citizen?.name?.toLowerCase().includes(term);
            const matchCnic = c.citizen?.cnic?.toLowerCase().includes(term);
            if (!matchNumber && !matchSubject && !matchCitizen && !matchCnic) return false;
        }

        if (activeFilter === 'Needs action') {
            return c.stage === 'application_submission' || c.status === 'New';
        }
        if (activeFilter === 'In progress') {
            return c.status === 'under_investigation' || c.status === 'pending_field_visit' || c.status === 'In progress';
        }
        if (activeFilter === 'Overdue') {
            return c.is_overdue || c.status === 'Overdue';
        }
        if (activeFilter === 'Duplicate flagged') {
            return c.has_pending_duplicate;
        }
        if (activeFilter === 'Reassignment pending') {
            return c.has_pending_reassignment;
        }

        return true;
    });

    const overdueComplaints = complaints.filter((c) => c.is_overdue || c.status === 'Overdue');
    const escalatedComplaints = complaints.filter((c) => c.status === 'escalated' || c.status === 'Escalated');

    // Counts for UI badges
    const totalCount = complaints.length;
    const newCount = metrics.new_unassigned ?? complaints.filter((c) => c.stage === 'application_submission').length;
    const overdueCount = metrics.overdue_count ?? overdueComplaints.length;
    const inProgressCount = metrics.under_investigation ?? complaints.filter((c) => c.stage === 'investigation_by_department').length;
    const resolvedTotal = metrics.resolved_total ?? (metrics.resolved_this_month || 0);

    // SVG Line chart calculations
    const seriesNow = metrics.series_now && metrics.series_now.length ? metrics.series_now : [4, 7, 6, 9, 8, 11];
    const seriesPrev = metrics.series_prev && metrics.series_prev.length ? metrics.series_prev : [3, 5, 6, 6, 7, 7];
    const weekLabels = metrics.week_labels && metrics.week_labels.length ? metrics.week_labels : ['6 Aug', '13 Aug', '20 Aug', '27 Aug', '3 Sep', '10 Sep'];

    const maxVal = Math.max(...seriesNow, ...seriesPrev, 12);
    const getSvgPoints = (arr) =>
        arr
            .map((v, i) => {
                const x = (i / (arr.length - 1)) * 520;
                const y = 150 - (v / maxVal) * 140;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ');

    const linePoints = getSvgPoints(seriesNow);
    const prevPoints = getSvgPoints(seriesPrev);
    const areaPath = `M0,150 L${linePoints.replace(/ /g, ' L')} L520,150 Z`;

    const slaPct = metrics.sla_adherence_pct ?? 86;

    return (
        <FocalPersonLayout
            activeTab={currentTab}
            onTabChange={setCurrentTab}
            counts={{
                totalN: totalCount,
                overdueN: overdueCount,
                escalatedN: escalatedComplaints.length,
            }}
        >
            <Head title={`Focal Person Console - ${department?.name || 'Department'}`} />

            {/* TAB 1: DASHBOARD (Golden Ratio Grid: 61.8% Analysis / 38.2% Operations) */}
            {currentTab === 'dashboard' && (
                <div className="max-w-[1360px] mx-auto space-y-5 animate-fadeIn">
                    {/* Header Row: Greeting & Export */}
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-fp-green tracking-tight">
                                Dashboard
                            </h1>
                            <p className="text-sm text-fp-ink-secondary mt-0.5">
                                <span className="font-semibold text-fp-green">{newCount} complaints</span> need acknowledgement today and{' '}
                                <span className="font-semibold text-fp-red">{overdueCount} are past the 15-day standard</span>.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 bg-white border border-fp-border rounded-full px-3.5 py-1.5 text-xs text-fp-ink font-medium tabular-nums shadow-xs">
                                <svg className="w-3.5 h-3.5 text-fp-ink-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="3" y="4" width="18" height="17" rx="2" />
                                    <path d="M8 2v4M16 2v4M3 10h18" strokeLinecap="round" />
                                </svg>
                                Last 30 days
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentTab('reports')}
                                className="inline-flex items-center gap-1.5 bg-fp-green hover:bg-fp-green-dark text-white rounded-full px-4 py-1.5 text-xs font-semibold shadow-xs transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>

                    {/* KPI Strip (4 Compact Cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {/* Card 1: Open complaints */}
                        <div className="bg-white border border-fp-border rounded-[18px] p-4 shadow-xs">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-xs font-semibold text-fp-ink-muted">Open complaints</span>
                                <span className="w-7 h-7 rounded-lg bg-fp-green-tint text-fp-green flex items-center justify-center text-xs">
                                    📋
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-outfit text-2xl sm:text-3xl font-bold text-fp-green tabular-nums">
                                    {totalCount}
                                </span>
                                <span className="text-[11px] font-semibold bg-fp-sand-card text-fp-ink-muted rounded-full px-2 py-0.5">
                                    Active queue
                                </span>
                            </div>
                            <p className="text-[11.5px] text-fp-ink-muted mt-1.5">Department wide caseload</p>
                        </div>

                        {/* Card 2: Needs acknowledgement */}
                        <div className="bg-white border border-fp-border rounded-[18px] p-4 shadow-xs">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-xs font-semibold text-fp-ink-muted">Needs acknowledgement</span>
                                <span className="w-7 h-7 rounded-lg bg-fp-gold-tint text-fp-gold flex items-center justify-center text-xs">
                                    ⏳
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-outfit text-2xl sm:text-3xl font-bold text-fp-green tabular-nums">
                                    {newCount}
                                </span>
                                <span className="text-[11px] font-semibold bg-fp-gold-tint text-[#8A6314] rounded-full px-2 py-0.5">
                                    48h standard
                                </span>
                            </div>
                            <p className="text-[11.5px] text-fp-ink-muted mt-1.5">Awaiting First Investigation</p>
                        </div>

                        {/* Card 3: Overdue complaints */}
                        <div className="bg-white border border-fp-border rounded-[18px] p-4 shadow-xs">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-xs font-semibold text-fp-ink-muted">Overdue</span>
                                <span className="w-7 h-7 rounded-lg bg-fp-red-tint text-fp-red flex items-center justify-center text-xs">
                                    ⚠️
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-outfit text-2xl sm:text-3xl font-bold text-fp-red tabular-nums">
                                    {overdueCount}
                                </span>
                                <span className="text-[11px] font-semibold bg-fp-red-tint text-fp-red-dark rounded-full px-2 py-0.5">
                                    &gt; 15 days
                                </span>
                            </div>
                            <p className="text-[11.5px] text-fp-ink-muted mt-1.5">Past statutory standard</p>
                        </div>

                        {/* Card 4: Resolved this period */}
                        <div className="bg-white border border-fp-border rounded-[18px] p-4 shadow-xs">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-xs font-semibold text-fp-ink-muted">Resolved this period</span>
                                <span className="w-7 h-7 rounded-lg bg-fp-emerald-tint text-fp-emerald flex items-center justify-center text-xs">
                                    ✓
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-outfit text-2xl sm:text-3xl font-bold text-fp-green tabular-nums">
                                    {resolvedTotal}
                                </span>
                                <span className="text-[11px] font-semibold bg-fp-emerald-tint text-fp-emerald rounded-full px-2 py-0.5">
                                    +18% vs prev
                                </span>
                            </div>
                            <p className="text-[11.5px] text-fp-ink-muted mt-1.5">Closed with citizen summary</p>
                        </div>
                    </div>

                    {/* GOLDEN RATIO 2-COLUMN SECTION */}
                    {/* Major Column ~61.8% | Minor Column ~38.2% */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* LEFT (MAJOR ~62% -> lg:col-span-7 or 8) */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                            {/* 1. Complaints Resolved SVG Curve */}
                            <div className="bg-white border border-fp-border rounded-[20px] p-5 shadow-xs">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <h2 className="font-outfit text-base font-bold text-fp-green">
                                        Complaints resolved
                                    </h2>
                                    <div className="flex items-center gap-3 text-[11.5px] text-fp-ink-muted">
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="w-3.5 h-0.5 bg-fp-green block"></span> Current
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="w-3.5 h-0 border-t-2 border-dashed border-[#BFC9C1] block"></span> Previous
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap sm:flex-nowrap items-end gap-5">
                                    <div className="flex-none">
                                        <div className="font-outfit text-3xl sm:text-4xl font-bold text-fp-green tabular-nums leading-none">
                                            {resolvedTotal}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <span className="text-[11px] font-semibold bg-fp-emerald-tint text-fp-emerald rounded-full px-2 py-0.5">
                                                +18%
                                            </span>
                                            <span className="text-[11px] text-fp-ink-muted">vs previous</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full min-w-0">
                                        <svg viewBox="0 0 520 150" preserveAspectRatio="none" className="w-full h-[120px] overflow-visible">
                                            <line x1="0" x2="520" y1="37.5" y2="37.5" stroke="#EFEADF" strokeWidth="1" strokeDasharray="4 5" />
                                            <line x1="0" x2="520" y1="75" y2="75" stroke="#EFEADF" strokeWidth="1" strokeDasharray="4 5" />
                                            <line x1="0" x2="520" y1="112.5" y2="112.5" stroke="#EFEADF" strokeWidth="1" strokeDasharray="4 5" />
                                            <path d={areaPath} fill="rgba(36,64,47,0.06)" />
                                            <polyline points={prevPoints} fill="none" stroke="#C8CFC8" strokeWidth="2" strokeDasharray="5 5" strokeLinejoin="round" />
                                            <polyline points={linePoints} fill="none" stroke="#24402F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                                        </svg>
                                        <div className="flex justify-between mt-2 text-[10.5px] text-fp-ink-muted tabular-nums">
                                            {weekLabels.map((lbl, idx) => (
                                                <span key={idx}>{lbl}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Where the queue sits (Horizontal Segments) */}
                            <div className="bg-white border border-fp-border rounded-[20px] p-4 sm:p-5 shadow-xs">
                                <h2 className="font-outfit text-base font-bold text-fp-green mb-3">
                                    Where the queue sits
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="border-l-2 border-fp-gold pl-3 py-0.5">
                                        <div className="font-outfit text-xl font-bold text-fp-green tabular-nums">
                                            {newCount}
                                        </div>
                                        <div className="text-[11.5px] text-fp-ink-muted leading-tight mt-0.5">Awaiting triage</div>
                                    </div>
                                    <div className="border-l-2 border-fp-emerald pl-3 py-0.5">
                                        <div className="font-outfit text-xl font-bold text-fp-green tabular-nums">
                                            {inProgressCount}
                                        </div>
                                        <div className="text-[11.5px] text-fp-ink-muted leading-tight mt-0.5">Under investigation</div>
                                    </div>
                                    <div className="border-l-2 border-[#B07A1E] pl-3 py-0.5">
                                        <div className="font-outfit text-xl font-bold text-fp-green tabular-nums">
                                            {escalatedComplaints.length}
                                        </div>
                                        <div className="text-[11.5px] text-fp-ink-muted leading-tight mt-0.5">Escalated by PMCC</div>
                                    </div>
                                    <div className="border-l-2 border-fp-red pl-3 py-0.5">
                                        <div className="font-outfit text-xl font-bold text-fp-red tabular-nums">
                                            {overdueCount}
                                        </div>
                                        <div className="text-[11.5px] text-fp-ink-muted leading-tight mt-0.5">Overdue (&gt;15d)</div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. "Needs your action" Triage Table (High Density) */}
                            <div className="bg-white border border-fp-border rounded-[20px] shadow-xs overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-fp-border">
                                    <div>
                                        <h2 className="font-outfit text-base font-bold text-fp-green">
                                            Needs your action
                                        </h2>
                                        <p className="text-xs text-fp-ink-muted">Urgent complaints requiring First Investigation or prompt response</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentTab('list')}
                                        className="text-xs font-semibold text-fp-gold hover:text-[#6E4A0F] cursor-pointer"
                                    >
                                        View all {complaints.length} →
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-fp-sand-subtle border-b border-fp-border text-[11px] uppercase tracking-wider text-fp-ink-muted font-bold">
                                            <tr>
                                                <th className="px-5 py-2.5">Complaint &amp; Complainant</th>
                                                <th className="px-3 py-2.5">Tehsil</th>
                                                <th className="px-3 py-2.5">Day of 15</th>
                                                <th className="px-4 py-2.5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-fp-border">
                                            {complaints.slice(0, 6).map((c) => {
                                                const isOver = c.is_overdue || c.days_open > 15;
                                                return (
                                                    <tr
                                                        key={c.id}
                                                        onClick={() => handleComplaintClick(c)}
                                                        className="hover:bg-fp-sand-subtle cursor-pointer transition"
                                                    >
                                                        <td className="px-5 py-3 max-w-[280px]">
                                                            <div className="font-semibold text-fp-ink text-[13.5px] line-clamp-1">
                                                                {c.subject}
                                                            </div>
                                                            <div className="text-[11.5px] text-fp-ink-muted tabular-nums mt-0.5">
                                                                {c.complaint_number} · <span className="font-medium text-fp-green">{c.citizen?.name || 'Citizen'}</span> (CNIC: {c.citizen?.cnic || 'Unmasked'})
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-fp-ink-secondary text-[12.5px]">
                                                            {c.tehsil?.name || 'Muzaffarabad'}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <span
                                                                className={`text-[12px] font-bold tabular-nums ${
                                                                    isOver ? 'text-fp-red' : c.days_open > 10 ? 'text-fp-gold' : 'text-fp-green'
                                                                }`}
                                                            >
                                                                Day {c.days_open} of 15
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span
                                                                className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                                                                    isOver
                                                                        ? 'bg-fp-red-tint text-fp-red-dark'
                                                                        : c.stage === 'application_submission'
                                                                        ? 'bg-fp-gold-tint text-[#7A5A18]'
                                                                        : 'bg-fp-emerald-tint text-fp-emerald'
                                                                }`}
                                                            >
                                                                {isOver ? 'Overdue' : c.stage === 'application_submission' ? 'New / Unassigned' : 'In progress'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT (MINOR ~38% -> lg:col-span-5 or 4) */}
                        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                            {/* 1. Busiest Day for Lodging Bar Chart */}
                            <div className="bg-white border border-fp-border rounded-[20px] p-5 shadow-xs">
                                <h2 className="font-outfit text-base font-bold text-fp-green">
                                    Busiest day for lodging
                                </h2>
                                <p className="text-xs text-fp-ink-muted mb-4">Complaints received by weekday</p>
                                <div className="flex items-end gap-2 h-[120px]">
                                    {(metrics.days_data || [
                                        { label: 'Mon', v: 5, is_peak: false },
                                        { label: 'Tue', v: 7, is_peak: true },
                                        { label: 'Wed', v: 4, is_peak: false },
                                        { label: 'Thu', v: 6, is_peak: false },
                                        { label: 'Fri', v: 5, is_peak: false },
                                        { label: 'Sat', v: 2, is_peak: false },
                                        { label: 'Sun', v: 1, is_peak: false },
                                    ]).map((d, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                                            <span className="text-[10.5px] font-semibold text-fp-green tabular-nums">
                                                {d.is_peak ? d.v : ''}
                                            </span>
                                            <div className="flex-1 w-full flex items-end">
                                                <div
                                                    style={{ height: `${Math.max(12, Math.round((d.v / 8) * 100))}%` }}
                                                    className={`w-full rounded-t-md transition-all ${
                                                        d.is_peak ? 'bg-fp-green' : 'bg-[#EDEAE1]'
                                                    }`}
                                                ></div>
                                            </div>
                                            <span className={`text-[11px] ${d.is_peak ? 'font-bold text-fp-green' : 'text-fp-ink-muted'}`}>
                                                {d.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Resolved Within Standard Circular Gauge */}
                            <div className="bg-white border border-fp-border rounded-[20px] p-5 shadow-xs text-center">
                                <h2 className="font-outfit text-base font-bold text-fp-green text-left mb-2">
                                    Resolved within standard
                                </h2>
                                <div className="relative max-w-[220px] mx-auto">
                                    <svg viewBox="0 0 220 130" className="w-full h-auto block">
                                        {Array.from({ length: 42 }).map((_, i) => {
                                            const angle = Math.PI * (1 - i / 41);
                                            const cx = 110;
                                            const cy = 105;
                                            const x1 = (cx + Math.cos(angle) * 68).toFixed(1);
                                            const y1 = (cy - Math.sin(angle) * 68).toFixed(1);
                                            const x2 = (cx + Math.cos(angle) * 90).toFixed(1);
                                            const y2 = (cy - Math.sin(angle) * 90).toFixed(1);
                                            const isActive = i / 41 <= slaPct / 100;
                                            return (
                                                <line
                                                    key={i}
                                                    x1={x1}
                                                    y1={y1}
                                                    x2={x2}
                                                    y2={y2}
                                                    stroke={isActive ? '#2F7A5A' : '#E6E2D8'}
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })}
                                        <text x="110" y="100" textAnchor="middle" className="font-outfit text-3xl font-bold fill-fp-green">
                                            {slaPct}%
                                        </text>
                                        <text x="110" y="118" textAnchor="middle" className="text-[10.5px] fill-fp-ink-muted">
                                            {metrics.resolved_within_sla ?? 39} of {resolvedTotal || 45} inside 15d
                                        </text>
                                    </svg>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentTab('reports')}
                                    className="w-full mt-2 border border-fp-border rounded-full py-1.5 text-xs font-semibold text-fp-ink hover:border-fp-gold hover:text-fp-gold transition cursor-pointer"
                                >
                                    Show performance details
                                </button>
                            </div>

                            {/* 3. Field Officers Availability */}
                            <div className="bg-white border border-fp-border rounded-[20px] p-5 shadow-xs">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-outfit text-base font-bold text-fp-green">
                                        Field officers
                                    </h2>
                                    <span className="text-xs text-fp-ink-muted">
                                        {fieldOfficers.length} under supervision
                                    </span>
                                </div>
                                <div className="divide-y divide-fp-border">
                                    {(fieldOfficers.length ? fieldOfficers : [
                                        { id: 1, name: 'Mudassar Farooq', area: 'Muzaffarabad, Domel', status: '3 visits open', tone: 'text-fp-emerald' },
                                        { id: 2, name: 'Hamza Kiani', area: 'Patika, Nauseri', status: 'Available', tone: 'text-fp-emerald' },
                                        { id: 3, name: 'Asma Rafiq', area: 'Garhi Dupatta', status: 'In field', tone: 'text-fp-gold' },
                                    ]).map((officer, i) => (
                                        <div key={officer.id || i} className="py-2.5 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-7 h-7 rounded-full bg-[#F0E6D2] text-[#8A6314] font-bold flex items-center justify-center text-[11px]">
                                                    {officer.name?.split(' ').map((w) => w[0]).join('').slice(0, 2) || 'FO'}
                                                </span>
                                                <div>
                                                    <div className="font-semibold text-fp-ink">{officer.name}</div>
                                                    <div className="text-[11px] text-fp-ink-muted">{officer.area || 'Field Inspector'}</div>
                                                </div>
                                            </div>
                                            <span className={`font-semibold text-[11.5px] ${officer.tone || 'text-fp-emerald'}`}>
                                                {officer.status || 'Active'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Service Standard Reminder Callout */}
                            <div className="bg-fp-green rounded-[20px] p-5 text-white shadow-xs">
                                <strong className="block font-outfit text-sm font-bold text-fp-gold-light mb-1">
                                    Statutory Service Standard
                                </strong>
                                <p className="text-xs text-[#C9D8CD] leading-relaxed">
                                    Acknowledge every citizen grievance within 48 hours and achieve resolution inside 15 days of departmental assignment. Extensions require Director sign-off.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ASSIGNED COMPLAINTS (Filterable Queue with Pills) */}
            {currentTab === 'list' && (
                <div className="max-w-[1260px] mx-auto space-y-4 animate-fadeIn">
                    <div>
                        <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-fp-green">
                            Assigned complaints
                        </h1>
                        <p className="text-xs text-fp-ink-muted mt-0.5">
                            {complaints.length} complaints routed to {department?.name || 'your department'}. Citizen identity unmasked for official verification.
                        </p>
                    </div>

                    {/* Filter Bar & Pills */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by reference, citizen name, or CNIC..."
                                className="flex-1 min-w-[260px] bg-white border border-fp-border rounded-full px-4 py-2 text-xs focus:ring-fp-green focus:border-fp-green shadow-xs"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="text-xs text-fp-ink-muted hover:text-fp-ink underline"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            {[
                                { key: 'All', label: `All (${complaints.length})` },
                                { key: 'Needs action', label: `Needs action (${newCount})` },
                                { key: 'In progress', label: `In progress (${inProgressCount})` },
                                { key: 'Overdue', label: `Overdue (${overdueCount})` },
                                { key: 'Duplicate flagged', label: `Duplicate flagged (${complaints.filter((c) => c.has_pending_duplicate).length})` },
                                { key: 'Reassignment pending', label: `Reassignment pending (${complaints.filter((c) => c.has_pending_reassignment).length})` },
                            ].map((f) => {
                                const isSelected = activeFilter === f.key;
                                return (
                                    <button
                                        key={f.key}
                                        type="button"
                                        onClick={() => setActiveFilter(f.key)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer border ${
                                            isSelected
                                                ? 'bg-[#F0E9DB] border-fp-gold text-fp-ink font-bold shadow-xs'
                                                : 'bg-white border-fp-border text-fp-ink-muted hover:bg-[#F3EEE4]'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Complaints Table */}
                    <div className="bg-white border border-fp-border rounded-[20px] overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-fp-sand-subtle border-b border-fp-border text-[11px] uppercase tracking-wider text-fp-ink-muted font-bold">
                                    <tr>
                                        <th className="px-5 py-3">Complaint</th>
                                        <th className="px-3 py-3">Category</th>
                                        <th className="px-3 py-3">Tehsil</th>
                                        <th className="px-3 py-3">Age</th>
                                        <th className="px-5 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-fp-border">
                                    {filteredComplaints.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-fp-ink-muted">
                                                No complaints match the current filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredComplaints.map((c) => {
                                            const isOver = c.is_overdue || c.days_open > 15;
                                            return (
                                                <tr
                                                    key={c.id}
                                                    onClick={() => handleComplaintClick(c)}
                                                    className="hover:bg-fp-sand-subtle cursor-pointer transition"
                                                >
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-fp-ink text-[13.5px]">
                                                                {c.subject}
                                                            </span>
                                                            {c.has_pending_duplicate && (
                                                                <span className="bg-fp-gold-tint text-[#7A5A18] text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                                                                    Duplicate Suggestion
                                                                </span>
                                                            )}
                                                            {c.has_pending_reassignment && (
                                                                <span className="bg-[#F0EDE4] text-fp-ink-muted text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                                                                    Reassignment Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11.5px] text-fp-ink-muted tabular-nums mt-0.5">
                                                            {c.complaint_number} · <strong className="text-fp-green">{c.citizen?.name}</strong> · CNIC: {c.citizen?.cnic}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3.5 text-fp-ink-secondary text-[12.5px]">
                                                        {c.category?.name || 'General'}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-fp-ink-secondary text-[12.5px]">
                                                        {c.tehsil?.name || 'District Center'}
                                                    </td>
                                                    <td className="px-3 py-3.5">
                                                        <span
                                                            className={`text-[12px] font-bold tabular-nums ${
                                                                isOver ? 'text-fp-red' : 'text-fp-ink'
                                                            }`}
                                                        >
                                                            {c.days_open}d
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <span
                                                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                                                isOver
                                                                    ? 'bg-fp-red-tint text-fp-red-dark'
                                                                    : c.stage === 'application_submission'
                                                                    ? 'bg-fp-gold-tint text-[#7A5A18]'
                                                                    : 'bg-fp-emerald-tint text-fp-emerald'
                                                            }`}
                                                        >
                                                            {isOver ? 'Overdue' : c.stage === 'application_submission' ? 'New' : 'In Progress'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: ESCALATIONS & OVERDUE (Direct Action Cards) */}
            {currentTab === 'escalations' && (
                <div className="max-w-[1260px] mx-auto space-y-5 animate-fadeIn">
                    <div>
                        <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-fp-green">
                            Escalations &amp; Overdue
                        </h1>
                        <p className="text-xs text-fp-ink-muted mt-0.5">
                            Complaints past the 15-day service threshold or flagged by the PMCC Contact Centre. Immediate action required.
                        </p>
                    </div>

                    {/* Escalations Metric Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="bg-fp-red-tint border border-[#F6C7BD] rounded-[18px] p-4">
                            <div className="text-xs font-semibold text-fp-red-dark">Past 15 days</div>
                            <div className="font-outfit text-3xl font-bold text-fp-red tabular-nums mt-1">
                                {overdueCount}
                            </div>
                        </div>
                        <div className="bg-fp-gold-tint border border-[#EBD5A6] rounded-[18px] p-4">
                            <div className="text-xs font-semibold text-[#8A6314]">Escalated by PMCC</div>
                            <div className="font-outfit text-3xl font-bold text-fp-gold tabular-nums mt-1">
                                {escalatedComplaints.length}
                            </div>
                        </div>
                        <div className="bg-white border border-fp-border rounded-[18px] p-4">
                            <div className="text-xs font-semibold text-fp-ink-muted">Reassignments Pending</div>
                            <div className="font-outfit text-3xl font-bold text-fp-green tabular-nums mt-1">
                                {reassignmentRequests.filter((r) => r.status === 'pending').length}
                            </div>
                        </div>
                    </div>

                    {/* Escalation Cards List */}
                    <div className="space-y-3">
                        {overdueComplaints.concat(escalatedComplaints).length === 0 ? (
                            <div className="bg-white border border-fp-border rounded-[20px] p-8 text-center text-fp-ink-muted">
                                No overdue or escalated complaints found for your department. Excellent compliance!
                            </div>
                        ) : (
                            overdueComplaints.concat(escalatedComplaints).map((c) => (
                                <div
                                    key={c.id}
                                    className="bg-white border border-fp-border rounded-[18px] p-5 shadow-xs border-l-4 border-l-fp-red"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1 max-w-[700px]">
                                            <div className="text-xs text-fp-ink-muted tabular-nums">
                                                {c.complaint_number} · Lodged {c.submitted_date_formatted} · {c.tehsil?.name || 'Center'}
                                            </div>
                                            <div className="font-outfit text-lg font-bold text-fp-green">
                                                {c.subject}
                                            </div>
                                            <p className="text-xs text-fp-ink-secondary">
                                                Complainant: <span className="font-semibold text-fp-green">{c.citizen?.name}</span> (CNIC: {c.citizen?.cnic} · Phone: {c.citizen?.mobile_number})
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-outfit text-2xl font-bold text-fp-red tabular-nums">
                                                {c.days_open}
                                            </div>
                                            <div className="text-[11px] text-fp-ink-muted">days open</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-fp-border">
                                        <button
                                            type="button"
                                            onClick={() => handleComplaintClick(c)}
                                            className="bg-fp-green hover:bg-fp-green-dark text-white rounded-full px-4 py-1.5 text-xs font-semibold shadow-xs transition"
                                        >
                                            Open Complaint
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openModal('escalate', c)}
                                            className="border border-fp-gold text-[#8A6314] hover:bg-fp-gold-tint rounded-full px-4 py-1.5 text-xs font-semibold transition"
                                        >
                                            Escalate to Admin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openModal('note', c)}
                                            className="border border-fp-border text-fp-ink-muted hover:bg-fp-sand-subtle rounded-full px-4 py-1.5 text-xs font-semibold transition"
                                        >
                                            Add Progress Note
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openModal('reassign', c)}
                                            className="border border-fp-border text-fp-ink-muted hover:bg-fp-sand-subtle rounded-full px-4 py-1.5 text-xs font-semibold transition"
                                        >
                                            Request Reassignment
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: REPORTS & PERFORMANCE */}
            {currentTab === 'reports' && (
                <div className="max-w-[1260px] mx-auto space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-fp-green">
                                Reports &amp; Performance
                            </h1>
                            <p className="text-xs text-fp-ink-muted mt-0.5">
                                Statutory metrics for {department?.name || 'Department'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="border border-fp-green text-fp-green hover:bg-fp-green hover:text-white rounded-full px-4 py-1.5 text-xs font-semibold transition"
                        >
                            Print Summary
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-fp-border rounded-[20px] p-5 shadow-xs">
                            <h2 className="font-outfit text-base font-bold text-fp-green mb-3">
                                SLA Performance
                            </h2>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-fp-border">
                                    <span className="text-fp-ink-muted">Resolution inside 15-day SLA</span>
                                    <span className="font-bold text-fp-emerald">{slaPct}%</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-fp-border">
                                    <span className="text-fp-ink-muted">First Investigation within 48h</span>
                                    <span className="font-bold text-fp-green">94%</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-fp-border">
                                    <span className="text-fp-ink-muted">Average Days to Closure</span>
                                    <span className="font-bold text-fp-green">8.4 days</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-fp-border rounded-[20px] p-5 shadow-xs">
                            <h2 className="font-outfit text-base font-bold text-fp-green mb-3">
                                Field Inspections
                            </h2>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-fp-border">
                                    <span className="text-fp-ink-muted">Supervised Field Officers</span>
                                    <span className="font-bold text-fp-green">{fieldOfficers.length} Active</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-fp-border">
                                    <span className="text-fp-ink-muted">Visits Completed This Month</span>
                                    <span className="font-bold text-fp-green">14 completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5 & 6: PROFILE & NOTIFICATIONS FALLBACKS */}
            {(currentTab === 'profile' || currentTab === 'notifications') && (
                <div className="max-w-[800px] mx-auto bg-white border border-fp-border rounded-[20px] p-6 shadow-xs animate-fadeIn">
                    <h1 className="font-outfit text-2xl font-bold text-fp-green mb-3 capitalize">
                        {currentTab}
                    </h1>
                    <p className="text-xs text-fp-ink-muted leading-relaxed">
                        Department: <strong>{department?.name}</strong> · Role: Official Focal Person · Jurisdiction: AJK Municipal &amp; Tehsil Scope
                    </p>
                    <button
                        type="button"
                        onClick={() => setCurrentTab('dashboard')}
                        className="mt-4 inline-block bg-fp-green text-white rounded-full px-4 py-1.5 text-xs font-semibold"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            )}

            {/* MODAL 1: REASSIGN COMPLAINT */}
            {activeModal === 'reassign' && selectedComplaint && (
                <div className="fixed inset-0 bg-[#16241C]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[22px] max-w-lg w-full p-6 shadow-2xl border border-fp-border animate-fadeIn">
                        <div className="text-[11px] font-bold text-fp-ink-muted uppercase tracking-wider">
                            {selectedComplaint.complaint_number}
                        </div>
                        <h2 className="font-outfit text-xl font-bold text-fp-green mt-1">
                            Request Cross-Department Reassignment
                        </h2>
                        <p className="text-xs text-fp-ink-secondary mt-1 mb-4">
                            This creates a pending request. The complaint remains with {department?.name} until approved by your Director.
                        </p>

                        <form onSubmit={submitReassignment} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-fp-ink mb-1">
                                    Target Department <span className="text-fp-red">*</span>
                                </label>
                                <select
                                    value={reassignData.to_department_id}
                                    onChange={(e) => setReassignData('to_department_id', e.target.value)}
                                    className="w-full border-fp-border rounded-xl text-xs py-2 px-3 focus:ring-fp-green focus:border-fp-green"
                                    required
                                >
                                    <option value="">-- Select Receiving Department --</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-fp-ink mb-1">
                                    Reason for Reassignment <span className="text-fp-red">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={reassignData.reason}
                                    onChange={(e) => setReassignData('reason', e.target.value)}
                                    placeholder="Explain specifically why this grievance falls under the jurisdiction of the destination department..."
                                    className="w-full border-fp-border rounded-xl text-xs p-3 focus:ring-fp-green focus:border-fp-green"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-fp-border rounded-full text-xs font-semibold text-fp-ink-muted hover:bg-fp-sand-subtle"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reassignProcessing}
                                    className="px-5 py-2 bg-fp-green hover:bg-fp-green-dark text-white rounded-full text-xs font-semibold shadow-xs"
                                >
                                    {reassignProcessing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: PROGRESS NOTE */}
            {activeModal === 'note' && selectedComplaint && (
                <div className="fixed inset-0 bg-[#16241C]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[22px] max-w-lg w-full p-6 shadow-2xl border border-fp-border animate-fadeIn">
                        <div className="text-[11px] font-bold text-fp-ink-muted uppercase tracking-wider">
                            {selectedComplaint.complaint_number}
                        </div>
                        <h2 className="font-outfit text-xl font-bold text-fp-green mt-1">
                            Add Progress Note
                        </h2>
                        <p className="text-xs text-fp-ink-secondary mt-1 mb-4">
                            Notes are recorded in the internal investigation audit log and visible to your Director.
                        </p>

                        <form onSubmit={submitProgressNote} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-fp-ink mb-1">
                                    Investigation Note <span className="text-fp-red">*</span>
                                </label>
                                <textarea
                                    rows="4"
                                    value={noteData.notes}
                                    onChange={(e) => setNoteData('notes', e.target.value)}
                                    placeholder="Site observations, citizen communication notes, or pending contractor actions..."
                                    className="w-full border-fp-border rounded-xl text-xs p-3 focus:ring-fp-green focus:border-fp-green"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-fp-border rounded-full text-xs font-semibold text-fp-ink-muted hover:bg-fp-sand-subtle"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={noteProcessing}
                                    className="px-5 py-2 bg-fp-green hover:bg-fp-green-dark text-white rounded-full text-xs font-semibold shadow-xs"
                                >
                                    {noteProcessing ? 'Saving...' : 'Save Note'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: ESCALATE TO ADMIN */}
            {activeModal === 'escalate' && selectedComplaint && (
                <div className="fixed inset-0 bg-[#16241C]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[22px] max-w-lg w-full p-6 shadow-2xl border border-fp-border animate-fadeIn">
                        <div className="text-[11px] font-bold text-fp-ink-muted uppercase tracking-wider">
                            {selectedComplaint.complaint_number}
                        </div>
                        <h2 className="font-outfit text-xl font-bold text-fp-green mt-1">
                            Escalate to Admin
                        </h2>
                        <div className="bg-fp-gold-tint text-[#7A5A18] rounded-xl p-3 text-xs mt-2 mb-4 leading-relaxed font-medium">
                            Escalating transfers executive review to the Prime Minister Contact Centre Admin. The public tracker shows &quot;Escalated for Higher Review&quot;, not &quot;Resolved&quot;.
                        </div>

                        <form onSubmit={submitEscalation} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-fp-ink mb-1">
                                    Escalation Reason <span className="text-fp-red">*</span>
                                </label>
                                <select
                                    value={escalateData.reason}
                                    onChange={(e) => setEscalateData('reason', e.target.value)}
                                    className="w-full border-fp-border rounded-xl text-xs py-2 px-3 focus:ring-fp-green focus:border-fp-green"
                                >
                                    <option>Beyond departmental authority</option>
                                    <option>Requires budget sanction</option>
                                    <option>Inter-departmental dispute</option>
                                    <option>Legal or court matter</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-fp-ink mb-1">
                                    Explanation <span className="text-fp-red">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={escalateData.notes}
                                    onChange={(e) => setEscalateData('notes', e.target.value)}
                                    placeholder="Describe why departmental action cannot resolve this case..."
                                    className="w-full border-fp-border rounded-xl text-xs p-3 focus:ring-fp-green focus:border-fp-green"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-fp-border rounded-full text-xs font-semibold text-fp-ink-muted hover:bg-fp-sand-subtle"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={escalateProcessing}
                                    className="px-5 py-2 bg-fp-gold hover:bg-[#B07A1E] text-white rounded-full text-xs font-semibold shadow-xs"
                                >
                                    {escalateProcessing ? 'Escalating...' : 'Confirm Escalation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </FocalPersonLayout>
    );
}
