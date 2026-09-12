import { Link, usePage } from '@inertiajs/react';

export default function FocalPersonLayout({
    children,
    headerRight = null,
    activeTab = 'dashboard',
    counts = {},
    onTabChange = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const departmentName = user?.department?.name || 'Public Works Department';

    const initials = user?.name
        ? user.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
        : 'FP';

    const navItems = [
        { key: 'dashboard', label: 'Dashboard', route: route('fp.dashboard') },
        {
            key: 'list',
            label: 'Assigned complaints',
            count: counts.total ?? counts.totalN ?? 0,
            badgeClass: 'bg-fp-green text-white',
        },
        {
            key: 'escalations',
            label: 'Escalations',
            count: (counts.overdueN ?? 0) + (counts.escalatedN ?? 0),
            badgeClass: 'bg-fp-red text-white',
        },
        { key: 'reports', label: 'Reports' },
    ];

    const accountItems = [
        { key: 'notifications', label: 'Notifications' },
        { key: 'profile', label: 'Profile & settings' },
    ];

    const handleNavClick = (item, e) => {
        if (onTabChange) {
            e?.preventDefault();
            onTabChange(item.key);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-fp-sand text-fp-ink font-sans antialiased">
            {/* 1. Institutional Top Sub-banner */}
            <div className="bg-gradient-to-r from-[#C8901F] to-[#D9A63A] text-white px-4 sm:px-7 py-2 flex flex-wrap items-center justify-between text-[12.5px] font-medium tracking-wide">
                <span>Government of Azad Jammu &amp; Kashmir</span>
                <span>Focal Person Console</span>
            </div>

            {/* 2. Global Dark Header */}
            <header className="bg-fp-green text-white px-4 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-4">
                {/* Brand / Department */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white text-fp-green flex items-center justify-center font-outfit font-bold text-sm tracking-wider shadow-sm">
                        PM
                    </div>
                    <div>
                        <div className="font-outfit text-lg sm:text-xl font-bold leading-tight tracking-tight">
                            PMCC
                        </div>
                        <div className="text-[11.5px] text-[#B9CCBF] font-normal">
                            {departmentName}
                        </div>
                    </div>
                </div>

                {/* Search Bar with Keyboard Shortcut */}
                <div className="flex-1 min-w-[220px] max-w-[380px] hidden md:flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-xs">
                    <svg className="w-3.5 h-3.5 text-[#B9CCBF] flex-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.4-3.4" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search complaints, citizens, references"
                        className="w-full bg-transparent border-none text-white text-xs placeholder-[#B9CCBF] focus:outline-none focus:ring-0 p-0"
                    />
                    <kbd className="text-[10px] text-[#C9D8CD] border border-white/25 rounded px-1.5 py-0.5 font-mono">
                        ⌘K
                    </kbd>
                </div>

                {/* User & Actions */}
                <div className="flex items-center gap-2.5">
                    {headerRight}

                    {/* Notification Pill */}
                    <button
                        type="button"
                        onClick={() => onTabChange?.('notifications')}
                        className="relative w-8 h-8 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                        title="Notifications"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
                            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" strokeLinecap="round" />
                            <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
                        </svg>
                        <span className="absolute -top-1 -right-1 bg-[#C52D19] border-2 border-fp-green rounded-full min-w-[17px] h-[17px] flex items-center justify-center text-[10px] font-bold px-0.5 text-white">
                            {counts.overdueN ?? 2}
                        </span>
                    </button>

                    {/* User Profile Pill */}
                    <button
                        type="button"
                        onClick={() => onTabChange?.('profile')}
                        className="flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 rounded-full pl-1 pr-3 py-1 text-xs font-semibold text-white transition cursor-pointer"
                    >
                        <span className="w-6 h-6 rounded-full bg-fp-gold-light text-fp-green flex items-center justify-center font-bold text-[11px]">
                            {initials}
                        </span>
                        <span className="hidden sm:inline-block max-w-[120px] truncate">{user?.name || 'Officer'}</span>
                    </button>

                    {/* Sign Out */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="border border-white/25 hover:border-fp-gold-light text-[#B9CCBF] hover:text-white rounded-full px-3 py-1 text-xs font-medium transition"
                    >
                        Sign out
                    </Link>
                </div>
            </header>

            {/* 3. Main Workspace with Golden Ratio Navigation Sidebar */}
            <div className="flex-1 flex flex-col md:flex-row items-stretch">
                {/* Persistent Sidebar */}
                <aside className="w-full md:w-[220px] lg:w-[240px] flex-none bg-white border-b md:border-b-0 md:border-r border-fp-border p-3.5 lg:p-4 flex flex-col justify-between">
                    <div className="space-y-1">
                        <div className="text-[11px] font-bold tracking-wider uppercase text-fp-ink-muted px-2.5 py-1">
                            Workspace
                        </div>
                        {navItems.map((item) => {
                            const isActive = activeTab === item.key;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={(e) => handleNavClick(item, e)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] font-medium transition text-left cursor-pointer ${
                                        isActive
                                            ? 'bg-[#F0E9DB] text-fp-ink font-semibold'
                                            : 'text-fp-ink hover:bg-[#F3EEE4]'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {item.count !== undefined && item.count > 0 && (
                                        <span
                                            className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${item.badgeClass}`}
                                        >
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        <div className="text-[11px] font-bold tracking-wider uppercase text-fp-ink-muted px-2.5 pt-4 pb-1">
                            Account
                        </div>
                        {accountItems.map((item) => {
                            const isActive = activeTab === item.key;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={(e) => handleNavClick(item, e)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] font-medium transition text-left cursor-pointer ${
                                        isActive
                                            ? 'bg-[#F0E9DB] text-fp-ink font-semibold'
                                            : 'text-fp-ink hover:bg-[#F3EEE4]'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Department Badge in Sidebar Footer */}
                    <div className="mt-6 pt-3 border-t border-fp-border text-[11px] text-fp-ink-muted space-y-1 px-1">
                        <div className="flex items-center gap-1.5 font-semibold text-fp-green">
                            <span className="w-1.5 h-1.5 rounded-full bg-fp-emerald"></span>
                            Scope Enforced
                        </div>
                        <p className="line-clamp-2">
                            {departmentName}
                        </p>
                    </div>
                </aside>

                {/* Primary Content Outlet */}
                <main className="flex-1 min-w-0 p-4 sm:p-5 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
