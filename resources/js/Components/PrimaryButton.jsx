export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-pmcc-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-pmcc-primary-hover focus:bg-pmcc-primary-hover focus:outline-none focus:ring-2 focus:ring-pmcc-accent focus:ring-offset-2 active:bg-pmcc-primary-hover ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
