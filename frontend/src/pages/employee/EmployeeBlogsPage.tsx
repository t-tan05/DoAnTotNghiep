import BlogStatusBadge from "@/components/blog/BlogStatusBadge";
import type { AdminColumn } from "@/components/admin/table/AdminDataTable";
import AdminDataTable from "@/components/admin/table/AdminDataTable";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { blogService } from "@/services/blog.service";
import type { SortOrder } from "@/types/admin-table.type";
import type { Blog, BlogSortBy } from "@/types/blog.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const columns: AdminColumn<Blog>[] = [
    {
        key: "title",
        title: "Tiêu đề",
        sortable: true,
        render: (blog) => (
            <div>
                <p className="font-medium">{blog.title}</p>
                <p className="text-sm text-muted-foreground">
                    Tác giả: {blog.users?.name || "Không rõ"}
                </p>
            </div>
        ),
    },
    {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        render: (blog) => <BlogStatusBadge status={blog.status} />,
    },
    {
        key: "created_at",
        title: "Ngày tạo",
        sortable: true,
        render: (blog) =>
            blog.created_at ? new Date(blog.created_at).toLocaleString("vi-VN") : "-",
    },
];

export default function EmployeeBlogsPage() {
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [deleteBlog, setDeleteBlog] = useState<Blog | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<BlogSortBy>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    async function fetchBlogs() {
        try {
            setLoading(true);

            const data = await blogService.getAdmin({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
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
    }, [page, search, sortBy, sortOrder]);

    function handleSortChange(nextSortBy: string) {
        if (sortBy === nextSortBy) {
            setSortOrder((current) => current === "asc" ? "desc" : "asc");
            return;
        }

        setSortBy(nextSortBy as BlogSortBy);
        setSortOrder("asc");
    }

    async function handleConfirmDelete() {
        if (!deleteBlog) return;

        try {
            setDeleting(true);
            await blogService.remove(deleteBlog.post_id);
            toast.success("Xóa bài viết thành công.");
            setDeleteBlog(null);
            fetchBlogs();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <AdminDataTable
                title="Quản lý bài viết"
                description="Nhân viên có thể tạo bài, sửa hoặc xóa bài viết của chính mình."
                items={blogs}
                columns={[
                    ...columns,
                    {
                        key: "preview",
                        title: "Review",
                        render: (blog) => (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/employee/blogs/${blog.post_id}/preview`)}
                            >
                                <Eye className="mr-1 h-4 w-4" />
                                Xem
                            </Button>
                        ),
                    },
                ]}
                idKey="post_id"
                search={search}
                page={page}
                totalPages={totalPages}
                sortBy={sortBy}
                sortOrder={sortOrder}
                loading={loading}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onPageChange={setPage}
                onSortChange={handleSortChange}
                onAdd={() => navigate("/employee/blogs/new")}
                onEdit={(blog) => navigate(`/employee/blogs/${blog.post_id}/edit`)}
                onDelete={setDeleteBlog}
            />

            <ConfirmDeleteDialog
                open={Boolean(deleteBlog)}
                loading={deleting}
                title="Xóa bài viết"
                description={`Bạn có chắc muốn xóa bài "${deleteBlog?.title}" không?`}
                onOpenChange={(open) => {
                    if (!open) setDeleteBlog(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}