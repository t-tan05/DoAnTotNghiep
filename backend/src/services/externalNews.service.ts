import { createBlogService } from "#services/blog.service";
import type {
    ExternalNewsArticle,
    ExternalNewsDetail,
    ExternalNewsSource,
    ExternalNewsSourceId,
    ImportExternalNewsPayload,
} from "#types/externalNews.type";
import AppError from "#utils/AppError";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import crypto from "crypto";
import Parser from "rss-parser";

const parser = new Parser({
    timeout: 12000,
    headers: {
        "User-Agent": "Mozilla/5.0 NewsReader/1.0",
    },
});

export const EXTERNAL_NEWS_SOURCES: ExternalNewsSource[] = [
    {
        id: "vnexpress-so-hoa",
        name: "VnExpress Số hóa",
        homepageUrl: "https://vnexpress.net/so-hoa",
        feedUrl: "https://vnexpress.net/rss/so-hoa.rss",
        language: "vi",
    },
    {
        id: "tinhte",
        name: "Tinhte",
        homepageUrl: "https://tinhte.vn",
        feedUrl: "https://tinhte.vn/rss",
        language: "vi",
    },
    {
        id: "genk",
        name: "GenK",
        homepageUrl: "https://genk.vn",
        feedUrl: "https://genk.vn/rss/home.rss",
        language: "vi",
    },
    {
        id: "techcrunch",
        name: "TechCrunch",
        homepageUrl: "https://techcrunch.com",
        feedUrl: "https://techcrunch.com/feed/",
        language: "en",
    },
    {
        id: "the-verge",
        name: "The Verge",
        homepageUrl: "https://www.theverge.com",
        feedUrl: "https://www.theverge.com/rss/index.xml",
        language: "en",
    },
];

const ARTICLE_SELECTORS: Record<ExternalNewsSourceId, string[]> = {
    "vnexpress-so-hoa": [
        "article.fck_detail",
        ".fck_detail",
        ".Normal",
    ],
    tinhte: [
        ".bbWrapper",
        "article",
        ".message-body",
    ],
    genk: [
        ".knc-content",
        ".detail-content",
        ".VCSortableInPreviewMode",
        "article",
    ],
    techcrunch: [
        ".article-content",
        ".entry-content",
        "article",
    ],
    "the-verge": [
        ".duet--article--article-body-component",
        ".c-entry-content",
        "article",
    ],
};

const ALLOWED_CONTENT_TAGS = new Set([
    "a",
    "b",
    "blockquote",
    "br",
    "div",
    "em",
    "h2",
    "h3",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "span",
    "strong",
    "u",
    "ul",
]);

const IMAGE_SOURCE_ATTRIBUTES = [
    "src",
    "data-src",
    "data-original",
    "data-url",
    "data-lazy-src",
    "data-llsrc",
];

function getSource(sourceId?: string) {
    if (!sourceId) return undefined;
    return EXTERNAL_NEWS_SOURCES.find((source) => source.id === sourceId);
}

function detectSourceByUrl(url: string) {
    return EXTERNAL_NEWS_SOURCES.find((source) => {
        try {
            return new URL(url).hostname.includes(new URL(source.homepageUrl).hostname.replace("www.", ""));
        } catch {
            return false;
        }
    });
}

function stripHtml(value?: string) {
    if (!value) return "";
    return cheerio.load(value).text().replace(/\s+/g, " ").trim();
}

function normalizeUrl(value?: string) {
    if (!value) return "";
    return value.trim();
}

function makeArticleId(url: string) {
    return crypto.createHash("sha1").update(url).digest("hex");
}

function getImageFromHtml(html?: string) {
    if (!html) return null;
    const $ = cheerio.load(html);
    const imageUrl = $("img").first().attr("src") || $("img").first().attr("data-src");
    return imageUrl || null;
}

function getMetaImage($: cheerio.CheerioAPI) {
    return (
        $('meta[property="og:image"]').attr("content")
        || $('meta[name="twitter:image"]').attr("content")
        || null
    );
}

function getMetaDescription($: cheerio.CheerioAPI) {
    return (
        $('meta[property="og:description"]').attr("content")
        || $('meta[name="description"]').attr("content")
        || ""
    );
}

function resolveUrl(url: string, baseUrl: string) {
    try {
        return new URL(url, baseUrl).toString();
    } catch {
        return "";
    }
}

function getUrlFromSrcset(value?: string) {
    if (!value) return "";

    const candidates = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const bestCandidate = candidates[candidates.length - 1];

    return bestCandidate?.split(/\s+/)[0] || "";
}

function isPlaceholderImage(url: string) {
    return (
        !url
        || url.startsWith("data:")
        || url.includes("blank.gif")
        || url.includes("transparent.gif")
        || url.includes("loading.gif")
    );
}

function getImageSource($: cheerio.CheerioAPI, element: Element) {
    const image = $(element);

    for (const attribute of IMAGE_SOURCE_ATTRIBUTES) {
        const value = image.attr(attribute);

        if (value && !isPlaceholderImage(value)) {
            return value;
        }
    }

    const srcsetUrl = getUrlFromSrcset(image.attr("srcset") || image.attr("data-srcset"));

    if (srcsetUrl && !isPlaceholderImage(srcsetUrl)) {
        return srcsetUrl;
    }

    const pictureSource = image.closest("picture").find("source").first();
    const pictureSrcsetUrl = getUrlFromSrcset(
        pictureSource.attr("srcset") || pictureSource.attr("data-srcset"),
    );

    if (pictureSrcsetUrl && !isPlaceholderImage(pictureSrcsetUrl)) {
        return pictureSrcsetUrl;
    }

    return "";
}

function sanitizeArticleContent(html: string, baseUrl: string) {
    const $ = cheerio.load(html);

    $("script, style, iframe, noscript, form, button, input, textarea, select").remove();

    $("*").each((_, element) => {
        const node = element as Element;
        const tagName = node.tagName?.toLowerCase();
        const imageSource = tagName === "img" ? getImageSource($, node) : "";

        if (!tagName || !ALLOWED_CONTENT_TAGS.has(tagName)) {
            $(element).replaceWith($(element).contents());
            return;
        }

        const attributes = { ...node.attribs };

        Object.keys(attributes).forEach((attribute) => {
            if (!["href", "src", "alt", "title"].includes(attribute)) {
                $(element).removeAttr(attribute);
            }
        });

        if (tagName === "a") {
            const href = $(element).attr("href");
            if (href) $(element).attr("href", resolveUrl(href, baseUrl));
            $(element).attr("target", "_blank");
            $(element).attr("rel", "noreferrer");
        }

        if (tagName === "img") {
            if (imageSource) {
                $(element).attr("src", resolveUrl(imageSource, baseUrl));
            } else {
                $(element).remove();
            }
        }
    });

    return $.root().html() || "";
}

function normalizeArticle(source: ExternalNewsSource, item: any): ExternalNewsArticle | null {
    const url = normalizeUrl(item.link || item.guid);
    if (!url) return null;

    const contentSnippet = item.contentSnippet || item.summary || item.content || "";
    const contentHtml = item["content:encoded"] || item.content || item.summary || "";

    return {
        id: makeArticleId(url),
        sourceId: source.id,
        sourceName: source.name,
        title: stripHtml(item.title),
        url,
        excerpt: stripHtml(contentSnippet).slice(0, 500),
        thumbnailUrl:
            item.enclosure?.url
            || item.image?.url
            || getImageFromHtml(contentHtml)
            || null,
        publishedAt: item.isoDate || item.pubDate || null,
    };
}

export const getExternalNewsSourcesService = () => {
    return { sources: EXTERNAL_NEWS_SOURCES };
};

export const getExternalNewsService = async (params: {
    sourceId?: string;
    search?: string;
    limit: number;
}) => {
    const sources = params.sourceId
        ? [getSource(params.sourceId)].filter(Boolean) as ExternalNewsSource[]
        : EXTERNAL_NEWS_SOURCES;

    if (!sources.length) {
        throw new AppError("Nguồn tin không hợp lệ.", 400);
    }

    const settledFeeds = await Promise.allSettled(
        sources.map(async (source) => {
            const feed = await parser.parseURL(source.feedUrl);
            return (feed.items || [])
                .map((item) => normalizeArticle(source, item))
                .filter(Boolean) as ExternalNewsArticle[];
        }),
    );

    const articles = settledFeeds
        .flatMap((result) => result.status === "fulfilled" ? result.value : [])
        .filter((article) => {
            if (!params.search) return true;
            const keyword = params.search.toLowerCase();
            return `${article.title} ${article.excerpt}`.toLowerCase().includes(keyword);
        })
        .sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, params.limit);

    return { articles };
};

export const getExternalNewsDetailService = async (url: string, sourceId?: string) => {
    const source = getSource(sourceId) || detectSourceByUrl(url);

    if (!source) {
        throw new AppError("Không xác định được nguồn tin từ URL.", 400);
    }

    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 NewsReader/1.0",
        },
    });

    if (!response.ok) {
        throw new AppError("Không thể lấy nội dung bài viết từ nguồn ngoài.", 502);
    }

    const pageHtml = await response.text();
    const $ = cheerio.load(pageHtml);
    const title = $("h1").first().text().trim() || $("title").text().trim();
    const excerpt = getMetaDescription($);
    const thumbnailUrl = getMetaImage($);
    const publishedAt =
        $('meta[property="article:published_time"]').attr("content")
        || $("time").first().attr("datetime")
        || null;

    const selectors = ARTICLE_SELECTORS[source.id];
    const contentNode = selectors
        .map((selector) => $(selector).first())
        .find((node) => node.length && node.text().trim().length > 120);

    const contentHtml = contentNode
        ? sanitizeArticleContent(contentNode.html() || "", url)
        : `<p>${stripHtml(excerpt)}</p>`;

    const detail: ExternalNewsDetail = {
        id: makeArticleId(url),
        sourceId: source.id,
        sourceName: source.name,
        title,
        url,
        excerpt: stripHtml(excerpt),
        thumbnailUrl,
        publishedAt,
        contentHtml,
    };

    return { article: detail };
};

export const importExternalNewsService = async (
    authorId: string,
    payload: ImportExternalNewsPayload,
) => {
    const { article } = await getExternalNewsDetailService(payload.url, payload.sourceId);

    const sourceNote = `
        <hr />
        <p><strong>Nguồn tham khảo:</strong> <a href="${article.url}" target="_blank" rel="noreferrer">${article.sourceName}</a></p>
    `;

    const data = await createBlogService(authorId, {
        title: article.title,
        content: `${article.contentHtml}${sourceNote}`,
        thumbnailUrl: article.thumbnailUrl,
        status: payload.status || "DRAFT",
    });

    return {
        article,
        blog: data.blog,
    };
};
