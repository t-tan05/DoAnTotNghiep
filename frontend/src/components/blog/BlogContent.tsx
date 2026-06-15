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
                "leading-8 text-foreground",
                "[&_a]:font-medium [&_a]:text-primary [&_a]:underline",
                "[&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
                "[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold",
                "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold",
                "[&_img]:my-5 [&_img]:max-h-[520px] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-contain",
                "[&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_ul]:list-disc",
                className,
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
    );
}
