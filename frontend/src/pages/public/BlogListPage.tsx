import PageLoading from "@/components/common/PageLoading";
import { Input } from "@/components/ui/input";
import { blogService } from "@/services/blog.service";
import type { Blog } from "@/types/blog.type";
import { blogHtmlToText } from "@/utils/blogHtml";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function BlogListPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    async function fetchBlogs() {
        try {
            setLoading(true);

            const data = await blogService.getPublic({
                page,
                limit: 9,
                search,
                sortBy: "published_at",
                sortOrder: "desc",
            });

            setBlogs(data?.blogs ?? []);
            setTotalPages(data?.meta.pagination.totalPages ?? 1);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(fetchBlogs, 300);
        return () => window.clearTimeout(timer);
    }, [page, search]);

    return (
        <section className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Tin tức</h1>
                    <p className="mt-1 text-muted-foreground">
                        Cập nhật bài viết và thông tin mới nhất.
                    </p>
                </div>

                <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Tìm bài viết..."
                        className="pl-9"
                    />
                </div>
            </div>

            {loading ? (
                <PageLoading text="Đang tải bài viết..." />
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                        <Link
                            key={blog.post_id}
                            to={`/tin-tuc/${blog.post_id}`}
                            className="overflow-hidden rounded-lg border bg-background hover:bg-muted/40"
                        >
                            {blog.thumbnail_url && (
                                <img
                                    src={blog.thumbnail_url}
                                    alt={blog.title}
                                    className="aspect-video w-full object-cover"
                                />
                            )}

                            <div className="p-4">
                                <h2 className="line-clamp-2 font-semibold">{blog.title}</h2>
                                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                    {blogHtmlToText(blog.content)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-6 flex justify-center gap-2">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded border px-3 py-2 disabled:opacity-50"
                >
                    Trước
                </button>

                <span className="px-3 py-2">Trang {page} / {totalPages}</span>

                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded border px-3 py-2 disabled:opacity-50"
                >
                    Sau
                </button>
            </div>
        </section>
    );
}
