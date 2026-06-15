import prisma from "#config/prisma";
import { normalizeText } from "#utils/normalizeText";
const blogInclude = {
    users: {
        select: {
            user_id: true,
            name: true,
            email: true,
        },
    },
    blog_categories: true,
};
export const findBlogById = async (postId) => {
    return await prisma.blog_posts.findUnique({
        where: {
            post_id: postId,
        },
        include: blogInclude,
    });
};
export const findBlogBySlug = async (slug) => {
    return await prisma.blog_posts.findUnique({
        where: {
            slug,
        },
        include: blogInclude,
    });
};
export const findPublicBlogsWithQuery = async (params) => {
    const { page, limit, search, sortBy, sortOrder, categoryId } = params;
    const skip = (page - 1) * limit;
    const where = {
        status: "PUBLISHED",
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(search
            ? {
                OR: [
                    { title: { contains: search } },
                    { slug: { contains: normalizeText(search) } },
                    { content: { contains: search } },
                ],
            }
            : {}),
    };
    const [blogs, totalItems] = await prisma.$transaction([
        prisma.blog_posts.findMany({
            where,
            skip,
            take: limit,
            include: blogInclude,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.blog_posts.count({ where }),
    ]);
    return { blogs, totalItems };
};
export const findAdminBlogsWithQuery = async (params) => {
    const { page, limit, search, sortBy, sortOrder, status, categoryId } = params;
    const skip = (page - 1) * limit;
    const where = {
        ...(status ? { status } : {}),
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(search
            ? {
                OR: [
                    { title: { contains: search } },
                    { slug: { contains: normalizeText(search) } },
                    { content: { contains: search } },
                    {
                        users: {
                            name: {
                                contains: search,
                            },
                        },
                    },
                    {
                        users: {
                            email: {
                                contains: search,
                            },
                        },
                    },
                ],
            }
            : {}),
    };
    const [blogs, totalItems] = await prisma.$transaction([
        prisma.blog_posts.findMany({
            where,
            skip,
            take: limit,
            include: blogInclude,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.blog_posts.count({ where }),
    ]);
    return { blogs, totalItems };
};
export const createBlog = async (data) => {
    return await prisma.blog_posts.create({
        data,
        include: blogInclude,
    });
};
export const updateBlog = async (postId, data) => {
    return await prisma.blog_posts.update({
        where: {
            post_id: postId,
        },
        data,
        include: blogInclude,
    });
};
export const deleteBlog = async (postId) => {
    return await prisma.blog_posts.delete({
        where: {
            post_id: postId,
        },
    });
};
export const findBlogCategoryById = async (categoryId) => {
    return await prisma.blog_categories.findUnique({
        where: {
            category_id: categoryId,
        },
    });
};
