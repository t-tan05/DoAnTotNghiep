import { createBlogService, deleteBlogService, getAdminBlogDetailService, getAdminBlogsService, getPublicBlogDetailService, getPublicBlogsService, updateBlogService, } from "#services/blog.service";
import { CatchAsync } from "#utils/CatchAsync";
import { parseListQuery } from "#utils/parseListQuery";
import { blog_posts_status } from "@prisma/client";
const allowedSortFields = ["title", "created_at", "published_at", "status"];
const parseBlogQuery = (req) => {
    const baseQuery = parseListQuery({
        query: req.query,
        allowedSortFields,
        defaultSortBy: "created_at",
    });
    const status = typeof req.query.status === "string"
        && Object.values(blog_posts_status).includes(req.query.status)
        ? req.query.status
        : undefined;
    const categoryId = typeof req.query.categoryId === "string" && req.query.categoryId.trim()
        ? req.query.categoryId.trim()
        : undefined;
    return {
        ...baseQuery,
        status,
        categoryId,
    };
};
export const getPublicBlogsController = CatchAsync(async (req, res) => {
    const data = await getPublicBlogsService(parseBlogQuery(req));
    res.status(200).json({
        success: true,
        message: "Lấy danh sách bài viết thành công",
        data: {
            ...data
        },
    });
});
export const getPublicBlogDetailController = CatchAsync(async (req, res) => {
    const data = await getPublicBlogDetailService(req.params.postId);
    res.status(200).json({
        success: true,
        message: "Lấy chi tiết bài viết thành công",
        data: {
            ...data
        },
    });
});
export const getAdminBlogsController = CatchAsync(async (req, res) => {
    const data = await getAdminBlogsService(parseBlogQuery(req));
    res.status(200).json({
        success: true,
        message: "Lấy danh sách bài viết quản trị thành công",
        data: {
            ...data
        },
    });
});
export const getAdminBlogDetailController = CatchAsync(async (req, res) => {
    const data = await getAdminBlogDetailService(req.params.postId);
    res.status(200).json({
        success: true,
        message: "Lấy chi tiết bài viết quản trị thành công",
        data: {
            ...data
        },
    });
});
export const createBlogController = CatchAsync(async (req, res) => {
    const data = await createBlogService(req.user.user_id, req.body);
    res.status(201).json({
        success: true,
        message: "Tạo bài viết thành công",
        data: {
            ...data
        },
    });
});
export const updateBlogController = CatchAsync(async (req, res) => {
    const data = await updateBlogService(req.params.postId, req.user.user_id, req.body);
    res.status(200).json({
        success: true,
        message: "Cập nhật bài viết thành công",
        data: {
            ...data
        },
    });
});
export const deleteBlogController = CatchAsync(async (req, res) => {
    const data = await deleteBlogService(req.params.postId, req.user);
    res.status(200).json({
        success: true,
        message: "Xóa bài viết thành công",
        data: {
            ...data
        },
    });
});
