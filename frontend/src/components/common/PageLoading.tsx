import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

type PageLoadingProps = {
    text?: string;
    className?: string;
    variant?: "card" | "plain";
};

export default function PageLoading({
    text = "Đang tải dữ liệu...",
    className,
    variant = "card",
}: PageLoadingProps) {
    return (
        <div className={cn(
            "flex items-center justify-center gap-3 text-sm text-muted-foreground",
            variant === "card" &&
                "rounded-xl border bg-white p-6 shadow-sm",
            variant === "plain" &&
                "py-8",
            className
        )}>
           <Spinner className="size-5 text-blue-700"/> 
           <span>{text}</span>
        </div>
    )
}