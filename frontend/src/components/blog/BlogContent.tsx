import { sanitizeBlogHtml } from "@/utils/blogHtml";
import { useMemo } from "react";

type Props = {
    html: string;
    className?: string;
};

export default function BlogContent({ html, className = "" }: Props) {
    const safeHtml = useMemo(() => sanitizeBlogHtml(html), [html]);

    return (
        <div
            className={[
                "leading-7 text-foreground",
                "[&_a]:font-medium [&_a]:text-primary [&_a]:underline",
                "[&_blockquote]:my-5 [&_blockquote]:border-0 [&_blockquote]:bg-muted/60 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:text-center [&_blockquote]:text-sm [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
                "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight",
                "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-tight",
                "[&_img]:my-5 [&_img]:max-h-[520px] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-contain",
                "[&_ol]:my-2 [&_ol]:list-decimal [&_ul]:my-2 [&_ul]:list-disc",
                "[&_li]:my-1 [&_li]:ml-5 [&_li>p]:my-0",
                "[&_p]:my-2",
                className,
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
    );
}
