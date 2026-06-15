import type { blog_posts_status } from "@prisma/client";

export type ExternalNewsSourceId =
    | "vnexpress-so-hoa"
    | "tinhte"
    | "genk"
    | "techcrunch"
    | "the-verge";

export type ExternalNewsSource = {
    id: ExternalNewsSourceId;
    name: string;
    homepageUrl: string;
    feedUrl: string;
    language: "vi" | "en";
};

export type ExternalNewsArticle = {
    id: string;
    sourceId: ExternalNewsSourceId;
    sourceName: string;
    title: string;
    url: string;
    excerpt: string;
    thumbnailUrl: string | null;
    publishedAt: string | null;
};

export type ExternalNewsDetail = ExternalNewsArticle & {
    contentHtml: string;
};

export type ImportExternalNewsPayload = {
    url: string;
    sourceId?: ExternalNewsSourceId;
    categoryId?: string | null;
    status?: blog_posts_status;
};
