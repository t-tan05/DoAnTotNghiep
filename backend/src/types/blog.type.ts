import { blog_posts_status } from "@prisma/client";
import { ListQuery } from "#types/pagination.type";


export type BlogSortBy = "title" | "created_at" | "published_at" | "status";

export type BlogListQuery = ListQuery<BlogSortBy> & {
    status?: blog_posts_status;
};

export interface CreateBlogPayload {
    title: string;
    content: string;
    status?: blog_posts_status;
    thumbnailUrl?: string | null;
}

export interface UpdateBlogPayload {
    title?: string;
    content?: string;
    status?: blog_posts_status;
    thumbnailUrl?: string | null;
}