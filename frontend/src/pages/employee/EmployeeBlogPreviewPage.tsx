import BlogContent from "@/components/blog/BlogContent";
import BlogStatusBadge from "@/components/blog/BlogStatusBadge";
import FormError from "@/components/common/FormError";
import PageLoading from "@/components/common/PageLoading";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import { blogService } from "@/services/blog.service";
import type { Blog } from "@/types/blog.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ArrowLeft, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function EmployeeBlogPreviewPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState("");

    async function fetchBlog() {
        if (!postId) return;

        try {
            setLoading(true);
            const data = await blogService.getAdminById(postId);
            setBlog(data?.blog || null);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBlog();
    }, [postId]);

    async function handlePublish() {
        if (!postId || !blog) return;

        try {
            setPublishing(true);

            await blogService.update(postId, {
                title: blog.title,
                content: blog.content,
                thumbnailUrl: blog.thumbnail_url ?? null,
                status: "PUBLISHED",
            });

            toast.success("Bài viết đã được public.");
            fetchBlog();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setPublishing(false);
        }
    }

    if (loading) return <PageLoading text="Đang tải bài viết..." />;
    if (error) return <FormError message={error} />;
    if (!blog) return <p>Không tìm thấy bài viết.</p>;

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <Button
                        variant="ghost"
                        className="mb-2 px-0 cursor-pointer"
                        onClick={() => navigate("/employee/blogs")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>

                    <h1 className="text-2xl font-semibold">{blog.title}</h1>

                    <div className="mt-2 flex items-center gap-2">
                        <BlogStatusBadge status={blog.status} />
                        <span className="text-sm text-muted-foreground">
                            Tác giả: {blog.users?.name}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/employee/blogs/${blog.post_id}/edit`)}
                        className="cursor-pointer"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Sửa lại
                    </Button>

                    {blog.status !== "PUBLISHED" && (
                        <SpinnerButton
                            type="button"
                            loading={publishing}
                            loadingText="Đang public..."
                            onClick={handlePublish}
                            className="cursor-pointer"
                        >
                            Public bài viết
                        </SpinnerButton>
                    )}
                </div>
            </div>

            {blog.thumbnail_url && (
                <img
                    src={blog.thumbnail_url}
                    alt={blog.title}
                    className="max-h-[420px] w-full rounded-lg object-cover"
                />
            )}

            <article className="rounded-lg border bg-background p-6">
                <BlogContent html={blog.content} />
            </article>
        </section>
    );
}
