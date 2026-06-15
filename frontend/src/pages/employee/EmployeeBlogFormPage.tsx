import BlogForm from "@/components/blog/BlogForm";
import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { blogService } from "@/services/blog.service";
import type { Blog, BlogPayload } from "@/types/blog.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { blogHtmlToText } from "@/utils/blogHtml";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function EmployeeBlogFormPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(postId);

    const [blog, setBlog] = useState<Blog | null>(null);
    const [loadingPage, setLoadingPage] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!postId) return;

        const id = postId;

        async function fetchBlog() {
            try {
                setLoadingPage(true);
                const data = await blogService.getAdminById(id);

                setBlog(data?.blog || null);
            } catch (error) {
                toast.error(getErrorMessage(error));
            } finally {
                setLoadingPage(false);
            }
        }

        fetchBlog();
    }, [postId]);

    async function handleSubmit(payload: BlogPayload) {
        setError("");

        if (!payload.title) return setError("Vui lòng nhập tiêu đề.");
        if (!blogHtmlToText(payload.content)) return setError("Vui lòng nhập nội dung.");

        try {
            setSaving(true);

            if (isEdit && postId) {
                await blogService.update(postId, payload);
                toast.success("Cập nhật bài viết thành công.");
            } else {
                await blogService.create(payload);
                toast.success("Tạo bài viết thành công.");
            }

            navigate("/employee/blogs");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    if (loadingPage) return <PageLoading text="Đang tải bài viết..." />;

    return (
        <section className="space-y-5">
            <div>
                <Button
                    variant="ghost"
                    className="mb-2 px-0 cursor-pointer"
                    onClick={() => navigate("/employee/blogs")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>

                <h1 className="text-2xl font-semibold">
                    {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
                </h1>
            </div>

            <BlogForm
                blog={blog}
                loading={saving}
                error={error}
                onCancel={() => navigate("/employee/blogs")}
                onSubmit={handleSubmit}
            />
        </section>
    );
}
