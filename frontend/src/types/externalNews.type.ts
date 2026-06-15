import type { Blog, BlogStatus } from "./blog.type";

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

export type ExternalNewsSourcesData = {
    sources: ExternalNewsSource[];
};

export type ExternalNewsListData = {
    articles: ExternalNewsArticle[];
};

export type ExternalNewsDetailData = {
    article: ExternalNewsDetail;
};

export type ImportExternalNewsData = {
    article: ExternalNewsDetail;
    blog: Blog;
};

export type ImportExternalNewsPayload = {
    url: string;
    sourceId?: ExternalNewsSourceId;
    categoryId?: string | null;
    status?: BlogStatus;
};
