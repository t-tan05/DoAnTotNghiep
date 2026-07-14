import type { ListMeta, ListQuery } from "./admin-table.type";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BlogSortBy = "title" | "created_at" | "published_at" | "status";

export type BlogAuthor = {
    user_id: string;
    name: string;
    email: string;
};

export type Blog = {
    post_id: string;
    title: string;
    slug: string;
    content: string;
    author_id: string;
    status: BlogStatus;
    published_at?: string | null;
    created_at?: string;
    updated_at?: string;
    thumbnail_url?: string | null;
    users?: BlogAuthor;
};

export type BlogListQuery = ListQuery<BlogSortBy> & {
    status?: BlogStatus;
};

export type BlogListData = {
    blogs: Blog[];
    meta: ListMeta<BlogSortBy>;
};

export type BlogDetailData = {
    blog: Blog;
};

export type BlogPayload = {
    title: string;
    content: string;
    status?: BlogStatus;
    thumbnailUrl?: string | null;
};