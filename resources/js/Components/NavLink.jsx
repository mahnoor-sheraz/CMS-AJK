import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-pmcc-accent text-white focus:border-pmcc-accent'
                    : 'border-transparent text-pmcc-accent-muted hover:border-gray-300 hover:text-white focus:border-gray-300 focus:text-white') +
                className
            }
        >
            {children}
        </Link>
    );
}
