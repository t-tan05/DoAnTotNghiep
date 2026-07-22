import { createBlog, deleteBlog, findAdminBlogsWithQuery, findBlogById, findBlogBySlug, findPublicBlogsWithQuery, updateBlog, } from "#models/blog.model";
import AppError from "#utils/AppError";
import { createSlug } from "#utils/createSlug";
import crypto from "crypto";
const BLOG_NOT_FOUND_MESSAGE = "Không tìm thấy bài viết.";
//Hàm tạo đường dẫn slug
const buildUniqueSlug = async (title, excludeProstId) => {
    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let index = 1;
    while (true) {
        const existedBlog = await findBlogBySlug(slug);
        if (!existedBlog || existedBlog.post_id === excludeProstId) {
            return slug;
        }
        slug = `${baseSlug}-${index}`;
        index++;
    }
};
//Hàm kiểm tra ai đang muốn sửa blog
const canEmployeeModifyBlog = (blog, userId) => {
    return blog.author_id === userId;
};
export const getPublicBlogsService = async (params) => {
    const { blogs, totalItems } = await findPublicBlogsWithQuery(params);
    return {
        blogs,
        meta: {
            pagination: {
                page: params.page,
                limit: params.limit,
                totalItems,
                totalPages: Math.ceil(totalItems / params.limit),
            },
            sort: {
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            },
            search: params.search,
            filters: {
                status: "PUBLISHED",
            },
        },
    };
};
export const getPublicBlogDetailService = async (postId) => {
    const blog = await findBlogById(postId);
    if (!blog || blog.status !== "PUBLISHED") {
        throw new AppError(BLOG_NOT_FOUND_MESSAGE, 404);
    }
    return { blog };
};
export const getAdminBlogsService = async (params) => {
    const { blogs, totalItems } = await findAdminBlogsWithQuery(params);
    return {
        blogs,
        meta: {
            pagination: {
                page: params.page,
                limit: params.limit,
                totalItems,
                totalPages: Math.ceil(totalItems / params.limit),
            },
            sort: {
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            },
            search: params.search,
            filters: {
                status: params.status,
            },
        },
    };
};
export const getAdminBlogDetailService = async (postId) => {
    const blog = await findBlogById(postId);
    if (!blog)
        throw new AppError(BLOG_NOT_FOUND_MESSAGE, 404);
    return { blog };
};
export const createBlogService = async (authorId, payload) => {
    const slug = await buildUniqueSlug(payload.title);
    const status = payload.status ?? "DRAFT";
    const blog = await createBlog({
        post_id: crypto.randomUUID(),
        title: payload.title.trim(),
        slug,
        content: payload.content,
        author_id: authorId,
        status,
        published_at: status === "PUBLISHED" ? new Date() : null,
        thumbnail_url: payload.thumbnailUrl || null,
    });
    return { blog };
};
export const updateBlogService = async (postId, userId, payload) => {
    const blog = await findBlogById(postId);
    if (!blog)
        throw new AppError(BLOG_NOT_FOUND_MESSAGE, 404);
    if (!canEmployeeModifyBlog(blog, userId)) {
        throw new AppError("Bạn chỉ được cập nhật bài viết do chính mình tạo.", 403);
    }
    const nextStatus = payload.status ?? blog.status;
    const shouldSetPublishedAt = blog.status !== "PUBLISHED" && nextStatus === "PUBLISHED";
    const updateData = {
        ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
        ...(payload.content !== undefined ? { content: payload.content } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.thumbnailUrl !== undefined ? { thumbnail_url: payload.thumbnailUrl || null } : {}),
        ...(shouldSetPublishedAt ? { published_at: new Date() } : {}),
    };
    if (payload.title !== undefined) {
        updateData.slug = await buildUniqueSlug(payload.title, postId);
    }
    const updatedBlog = await updateBlog(postId, updateData);
    return { updatedBlog };
};
export const deleteBlogService = async (postId, user) => {
    const blog = await findBlogById(postId);
    if (!blog)
        throw new AppError(BLOG_NOT_FOUND_MESSAGE, 404);
    const roles = user.roles ?? [];
    const isAdmin = roles.includes("ADMIN");
    const isEmployee = roles.includes("EMPLOYEE");
    if (!isAdmin && isEmployee && blog.author_id !== user.user_id) {
        throw new AppError("Bạn chỉ được xóa bài viết do chính mình tạo.", 403);
    }
    if (!isAdmin && !isEmployee) {
        throw new AppError("Bạn không có quyền xóa bài viết.", 403);
    }
    const deletedBlog = await deleteBlog(postId);
    return { deletedBlog };
};
