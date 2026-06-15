import BlogContent from "@/components/blog/BlogContent";
import PageLoading from "@/components/common/PageLoading";
import SpinnerButton from "@/components/common/SpinnerButton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { externalNewsService } from "@/services/externalNews.service";
import type {
    ExternalNewsArticle,
    ExternalNewsDetail,
    ExternalNewsSource,
    ExternalNewsSourceId,
} from "@/types/externalNews.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ArrowUpRight, Eye, FilePlus2, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ALL_SOURCES_VALUE = "all";

export default function EmployeeExternalNewsPage() {
    const navigate = useNavigate();

    const [sources, setSources] = useState<ExternalNewsSource[]>([]);
    const [articles, setArticles] = useState<ExternalNewsArticle[]>([]);
    const [selectedSource, setSelectedSource] = useState<string>(ALL_SOURCES_VALUE);
    const [search, setSearch] = useState("");
    const [loadingSources, setLoadingSources] = useState(true);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [previewArticle, setPreviewArticle] = useState<ExternalNewsDetail | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [importingUrl, setImportingUrl] = useState("");

    const sourceId = useMemo(() => {
        return selectedSource === ALL_SOURCES_VALUE
            ? undefined
            : selectedSource as ExternalNewsSourceId;
    }, [selectedSource]);

    async function fetchSources() {
        try {
            setLoadingSources(true);
            const data = await externalNewsService.getSources();
            setSources(data?.sources ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoadingSources(false);
        }
    }

    async function fetchArticles() {
        try {
            setLoadingArticles(true);

            const data = await externalNewsService.getArticles({
                sourceId,
                search,
                limit: 30,
            });

            setArticles(data?.articles ?? []);
        } catch (error) {
            toast.error(getErrorMessage(error));
            setArticles([]);
        } finally {
            setLoadingArticles(false);
        }
    }

    useEffect(() => {
        fetchSources();
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(fetchArticles, 350);
        return () => window.clearTimeout(timer);
    }, [sourceId, search]);

    async function handlePreview(article: ExternalNewsArticle) {
        try {
            setPreviewLoading(true);
            setPreviewArticle(null);

            const data = await externalNewsService.getDetail({
                url: article.url,
                sourceId: article.sourceId,
            });

            setPreviewArticle(data?.article ?? null);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setPreviewLoading(false);
        }
    }

    async function handleImport(article: ExternalNewsArticle) {
        try {
            setImportingUrl(article.url);

            const data = await externalNewsService.importToBlog({
                url: article.url,
                sourceId: article.sourceId,
                status: "DRAFT",
            });

            toast.success("Đã import thành bài nháp. Hãy biên tập lại trước khi public.");

            if (data?.blog?.post_id) {
                navigate(`/employee/blogs/${data.blog.post_id}/edit`);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setImportingUrl("");
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Lấy tin công nghệ</h1>
                    <p className="mt-1 text-muted-foreground">
                        Chọn bài từ nguồn ngoài, xem trước, rồi import thành bản nháp để biên tập lại.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={fetchArticles}
                    disabled={loadingArticles}
                    className="cursor-pointer"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Làm mới
                </Button>
            </div>

            <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[260px_1fr]">
                <div className="space-y-2">
                    <Label>Nguồn tin</Label>
                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn nguồn" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                            <SelectItem value={ALL_SOURCES_VALUE}>Tất cả nguồn</SelectItem>
                            {sources.map((source) => (
                                <SelectItem key={source.id} value={source.id}>
                                    {source.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Tìm kiếm</Label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Tìm theo tiêu đề hoặc mô tả..."
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            {loadingSources || loadingArticles ? (
                <PageLoading text="Đang tải tin công nghệ..." />
            ) : articles.length === 0 ? (
                <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">
                    Không có bài viết phù hợp.
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {articles.map((article) => (
                        <article
                            key={article.id}
                            className="grid gap-4 rounded-lg border bg-background p-4 sm:grid-cols-[160px_1fr]"
                        >
                            <div className="overflow-hidden rounded-lg border bg-muted">
                                {article.thumbnailUrl ? (
                                    <img
                                        src={article.thumbnailUrl}
                                        alt={article.title}
                                        className="aspect-video h-full w-full object-cover sm:aspect-square"
                                    />
                                ) : (
                                    <div className="flex aspect-video h-full min-h-32 items-center justify-center text-sm text-muted-foreground sm:aspect-square">
                                        Không có ảnh
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 space-y-3">
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span className="rounded-full bg-muted px-2 py-1">{article.sourceName}</span>
                                        <span>
                                            {article.publishedAt
                                                ? new Date(article.publishedAt).toLocaleString("vi-VN")
                                                : "Chưa rõ ngày"}
                                        </span>
                                    </div>

                                    <h2 className="line-clamp-2 font-semibold">{article.title}</h2>
                                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                        {article.excerpt || "Bài viết chưa có mô tả."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePreview(article)}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Xem trước
                                    </Button>

                                    <SpinnerButton
                                        type="button"
                                        size="sm"
                                        loading={importingUrl === article.url}
                                        loadingText="Đang import..."
                                        onClick={() => handleImport(article)}
                                        className="cursor-pointer"
                                    >
                                        <FilePlus2 className="mr-2 h-4 w-4" />
                                        Import nháp
                                    </SpinnerButton>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="cursor-pointer"
                                    >
                                        <a href={article.url} target="_blank" rel="noreferrer">
                                            <ArrowUpRight className="mr-2 h-4 w-4" />
                                            Mở nguồn
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <Dialog
                open={previewLoading || Boolean(previewArticle)}
                onOpenChange={(open) => {
                    if (!open) setPreviewArticle(null);
                }}
            >
                <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl">
                    {previewLoading ? (
                        <PageLoading text="Đang lấy nội dung bài viết..." />
                    ) : previewArticle ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>{previewArticle.title}</DialogTitle>
                                <DialogDescription>
                                    {previewArticle.sourceName}
                                    {previewArticle.publishedAt
                                        ? ` - ${new Date(previewArticle.publishedAt).toLocaleString("vi-VN")}`
                                        : ""}
                                </DialogDescription>
                            </DialogHeader>

                            {previewArticle.thumbnailUrl && (
                                <img
                                    src={previewArticle.thumbnailUrl}
                                    alt={previewArticle.title}
                                    className="max-h-[360px] w-full rounded-lg object-cover"
                                />
                            )}

                            <BlogContent html={previewArticle.contentHtml} />

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPreviewArticle(null)}
                                    className="cursor-pointer"
                                >
                                    Đóng
                                </Button>

                                <SpinnerButton
                                    type="button"
                                    loading={importingUrl === previewArticle.url}
                                    loadingText="Đang import..."
                                    onClick={() => handleImport(previewArticle)}
                                    className="cursor-pointer"
                                >
                                    Import thành bản nháp
                                </SpinnerButton>
                            </DialogFooter>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>
        </section>
    );
}
