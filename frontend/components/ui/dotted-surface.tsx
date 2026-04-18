import { cn } from "@/lib/utils/cn";

export const DottedSurface = ({
    className,
    children,
    dotColor = "rgba(94, 93, 89, 0.15)", // Olive gray equivalent with opacity
    size = 20,
}: {
    className?: string;
    children?: React.ReactNode;
    dotColor?: string;
    size?: number;
}) => {
    return (
        <div
            className={cn(
                "relative h-full w-full bg-background flex items-center justify-center",
                className
            )}
        >
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(${dotColor} 2px, transparent 2px)`,
                    backgroundSize: `${size}px ${size}px`,
                }}
            />
            {/* Soft fade out masks at edges */}
            <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-background mix-blend-normal"></div>

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};