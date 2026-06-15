import BlogContent from "@/components/blog/BlogContent";
import FormError from "@/components/common/FormError";
import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { blogService } from "@/services/blog.service";
import type { Blog } from "@/types/blog.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function BlogDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchBlog() {
            if (!postId) return;

            try {
                setLoading(true);
                const data = await blogService.getPublicById(postId);
                setBlog(data?.blog || null);
            } catch (error) {
                setError(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        }

        fetchBlog();
    }, [postId]);

    if (loading) return <PageLoading text="Đang tải bài viết..." />;
    if (error) return <FormError message={error} />;
    if (!blog) return <p>Không tìm thấy bài viết.</p>;

    return (
        <article className="mx-auto max-w-4xl px-4 py-8">
            <Button variant="ghost" className="mb-4 px-0" onClick={() => navigate("/tin-tuc")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
            </Button>

            <h1 className="text-3xl font-semibold">{blog.title}</h1>

            <p className="mt-2 text-sm text-muted-foreground">
                {blog.published_at
                    ? new Date(blog.published_at).toLocaleString("vi-VN")
                    : ""}
            </p>

            {blog.thumbnail_url && (
                <img
                    src={blog.thumbnail_url}
                    alt={blog.title}
                    className="my-6 max-h-[460px] w-full rounded-lg object-cover"
                />
            )}

            <BlogContent html={blog.content} />
        </article>
    );
}
