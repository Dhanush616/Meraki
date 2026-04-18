import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            ref={ref}
            className={cn(
                "flex h-9 w-full rounded-lg border border-oat-border bg-ivory px-3 py-2 text-sm text-near-black placeholder:text-olive-gray/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
});
Input.displayName = "Input";

export { Input };
