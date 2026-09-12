import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [loginStep, setLoginStep] = useState(1);
    const [otpCode, setOtpCode] = useState(['4', '9', '2', '', '', '']);
    const [secondsLeft, setSecondsLeft] = useState(24);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'focal.person@ajk.gov.pk',
        password: 'password',
        remember: false,
    });

    // Countdown timer for code resend
    useState(() => {
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    });

    const handleContinueToOtp = (e) => {
        e?.preventDefault();
        if (!data.email || !data.password) {
            post(route('login'), {
                onFinish: () => reset('password'),
            });
            return;
        }
        setLoginStep(2);
    };

    const handleOtpChange = (index, value) => {
        // Handle full 6-digit paste
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 6).split('');
            if (digits.length > 0) {
                const newOtp = [...otpCode];
                digits.forEach((d, i) => {
                    if (index + i < 6) newOtp[index + i] = d;
                });
                setOtpCode(newOtp);
                const nextIdx = Math.min(5, index + digits.length);
                document.getElementById(`otp-${nextIdx}`)?.focus();
                return;
            }
        }

        const newOtp = [...otpCode];
        newOtp[index] = value.slice(-1);
        setOtpCode(newOtp);

        // Auto-advance to next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const submit = (e) => {
        e?.preventDefault();
        post(route('login'), {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-fp-sand text-fp-ink font-sans antialiased">
            <Head title="Officer Login - PMCC Focal Person" />

            {/* LEFT HERO BRAND COLUMN (Deep Forest Green with Radial Glow) */}
            <div className="flex-1 bg-fp-green text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between gap-8 relative overflow-hidden min-h-[380px] md:min-h-screen">
                {/* Subtle Radial Glow */}
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-radial from-fp-gold/30 to-transparent pointer-events-none"></div>

                {/* Top Brand Mark */}
                <div className="flex items-center gap-3.5 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-white text-fp-green flex items-center justify-center font-outfit font-bold text-base tracking-wider shadow-sm">
                        PM
                    </div>
                    <div>
                        <div className="font-outfit text-2xl font-bold leading-tight tracking-tight">
                            PMCC
                        </div>
                        <div className="text-xs text-[#B9CCBF] font-normal">
                            Prime Minister's Contact Centre
                        </div>
                    </div>
                </div>

                {/* Middle Hero Copy */}
                <div className="relative z-10 max-w-lg space-y-4">
                    <div className="inline-flex items-center gap-2 bg-fp-gold/15 text-fp-gold-light border border-fp-gold/25 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-fp-gold-light"></span>
                        Focal Person Access
                    </div>
                    <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold text-fp-gold-light leading-tight">
                        Sign in to your desk.
                    </h1>
                    <p className="text-sm sm:text-base text-[#C9D8CD] leading-relaxed">
                        Complaints routed to your department are waiting. Acknowledge within 48 hours and resolve inside the 15-day statutory service standard.
                    </p>
                </div>

                {/* Bottom Legal / Security Notice */}
                <div className="relative z-10 flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-2xl p-4 text-xs text-[#C9D8CD] max-w-md">
                    <span className="text-base text-fp-gold-light">🔒</span>
                    <span>Government-issued credentials only. Sessions expire after 30 minutes idle.</span>
                </div>
            </div>

            {/* RIGHT FORM COLUMN */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-6 animate-fadeIn">
                    {status && (
                        <div className="p-3.5 rounded-xl text-xs font-semibold bg-fp-emerald-tint text-fp-emerald border border-fp-emerald/20">
                            {status}
                        </div>
                    )}

                    {loginStep === 1 ? (
                        /* STEP 1: CREDENTIALS */
                        <form onSubmit={handleContinueToOtp} className="space-y-5">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-fp-ink-muted font-bold">
                                    Step 1 of 2
                                </div>
                                <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-fp-green mt-1">
                                    Officer login
                                </h2>
                                <p className="text-xs sm:text-sm text-fp-ink-secondary mt-1">
                                    Use the PMCC account issued by your department.
                                </p>
                            </div>

                            {/* Email / Identifier */}
                            <div>
                                <label className="block text-xs font-semibold text-fp-ink mb-1.5">
                                    Official email or CNIC
                                </label>
                                <input
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={data.email}
                                    placeholder="focal.person@ajk.gov.pk"
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-2xl border-fp-border-dark bg-fp-sand-subtle text-fp-ink text-sm px-4 py-3.5 focus:border-fp-gold focus:ring-fp-gold shadow-2xs transition"
                                    autoComplete="username"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.email} className="mt-1.5" />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-fp-ink mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-2xl border-fp-border-dark bg-fp-sand-subtle text-fp-ink text-sm px-4 py-3.5 focus:border-fp-gold focus:ring-fp-gold shadow-2xs transition"
                                    autoComplete="current-password"
                                    required
                                />
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 text-fp-ink-secondary cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-fp-border-dark text-fp-green focus:ring-fp-green w-4 h-4"
                                    />
                                    Keep me signed in
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-medium text-fp-gold hover:text-[#8A5E14]"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* Continue Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 rounded-full bg-fp-red hover:bg-fp-red-dark text-white font-semibold text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>Continue</span>
                                <span>→</span>
                            </button>
                        </form>
                    ) : (
                        /* STEP 2: 6-DIGIT OTP VERIFICATION */
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <div className="text-[12px] uppercase tracking-[0.14em] text-fp-ink-muted font-bold">
                                    Step 2 of 2
                                </div>
                                <h2 className="font-outfit text-3xl sm:text-[34px] font-bold text-fp-green mt-1.5 mb-2 leading-tight">
                                    Verify it's you
                                </h2>
                                <p className="text-[14px] text-fp-ink-secondary leading-relaxed mb-6">
                                    We sent a 6-digit code to the mobile registered with this account, ending in{' '}
                                    <strong className="text-fp-ink font-semibold">••• 4417</strong>.
                                </p>
                            </div>

                            {/* 6-box OTP grid matching prototype styling */}
                            <div className="grid grid-cols-6 gap-2 sm:gap-2.5 my-5">
                                {otpCode.map((digit, index) => {
                                    const isFilled = Boolean(digit);
                                    return (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            autoFocus={index === 3}
                                            className={`w-full text-center py-3 sm:py-3.5 text-lg sm:text-2xl font-bold rounded-xl border transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-fp-green focus:border-fp-green ${
                                                isFilled
                                                    ? 'bg-white border-fp-green text-fp-ink'
                                                    : 'bg-fp-sand-subtle border-fp-border-dark text-fp-ink'
                                            }`}
                                        />
                                    );
                                })}
                            </div>

                            <div className="text-xs text-fp-ink-secondary">
                                Didn't get it?{' '}
                                {secondsLeft > 0 ? (
                                    <span>
                                        <span className="text-fp-gold font-semibold">Resend code</span> in 0:
                                        {secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSecondsLeft(30);
                                            alert('New verification code sent to your registered mobile number.');
                                        }}
                                        className="text-fp-gold font-bold hover:underline"
                                    >
                                        Resend code now
                                    </button>
                                )}
                            </div>

                            {/* Submit & Verify */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 rounded-full bg-fp-red hover:bg-[#D22F19] text-white font-semibold text-[15px] shadow-[0_10px_22px_rgba(238,59,35,0.26)] transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>{processing ? 'Signing in...' : 'Verify and sign in'}</span>
                                <span>→</span>
                            </button>

                            {/* Back Button */}
                            <button
                                type="button"
                                onClick={() => setLoginStep(1)}
                                className="w-full py-3 rounded-full border border-fp-border-dark text-fp-ink-secondary hover:bg-[#F3EEE4] text-xs font-medium transition cursor-pointer"
                            >
                                Back
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
