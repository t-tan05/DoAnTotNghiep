import { Button } from "@/components/ui/button";
import type { Blog } from "@/types/blog.type";
import { blogHtmlToText } from "@/utils/blogHtml";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
    blogs: Blog[];
};

export default function TechNewsSection({ blogs }: Props) {
    if(!blogs.length) return null;

    return (
        <section className="rounded-md bg-white p-4 md:p-6">
            <div className="mb-5 text-center">
                <h2 className="text-3xl font-bold text-blue-700 md:text-5xl">
                    Bảng tin công nghệ
                </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {blogs.slice(0, 4).map((blog) => (
                    <article key={blog.post_id} className="flex min-h-[420px] flex-col bg-white shadow-sm ring-1 ring-border">
                        <Link to={`/tin-tuc/${blog.post_id}`} className="block overflow-hidden">
                            {blog.thumbnail_url ? (
                                <img
                                    src={blog.thumbnail_url}
                                    alt={blog.title}
                                    className="aspect-[16/9] w-full object-cover transition duration-300 hover:scale-110"
                                />
                            ) : (
                                <div className="flex aspect-[16/9] items-center justify-center bg-muted text-sm text-muted-foreground">
                                    Không có ảnh
                                </div>
                            )}
                        </Link>

                        <div className="flex flex-1 flex-col p-4">
                            <Link to={`/tin-tuc/${blog.post_id}`}>
                                <h3 className="line-clamp-2 text-base font-bold text-slate-900 hover:text-blue-700">
                                    {blog.title}
                                </h3>
                            </Link>

                            <p className="mt-5 line-clamp-4 text-sm leading-6 text-muted-foreground">
                                {blogHtmlToText(blog.content)}
                            </p>

                            <div className="mt-auto flex justify-end pt-5">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="cursor-pointer border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
                                >
                                    <Link to={`/tin-tuc/${blog.post_id}`}>Xem chi tiết</Link>
                                </Button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-6 flex justify-center">
                <Link to="/tin-tuc" className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:underline">
                    Xem tất cả
                    <ChevronRight className="size-4" />
                </Link>
            </div>
        </section>
    );
}
