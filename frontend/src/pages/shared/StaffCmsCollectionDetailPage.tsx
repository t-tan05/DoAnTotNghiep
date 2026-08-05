import CmsCollectionFormDialog from "@/components/admin/cms/CmsCollectionFormDialog";
import CmsRuleFormDialog from "@/components/admin/cms/CmsRuleFormDialog";
import CmsSectionFormDialog from "@/components/admin/cms/CmsSectionFormDialog";
import CmsSectionItemFormDialog from "@/components/admin/cms/CmsSectionItemFormDialog";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import FormError from "@/components/common/FormError";
import PageLoading from "@/components/common/PageLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cmsService } from "@/services/cms.service";
import type { CmsCollection, CmsCollectionRule, CmsSection, CmsSectionItem } from "@/types/cms.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

type Props = {
    basePath: string;
    canDelete?: boolean;
};

const sectionTypeLabel: Record<string, string> = {
    BANNER: "Banner",
    SHORTCUT_BUTTONS: "Nút lọc nhanh",
    SHORTCUT_CARDS: "Thẻ danh mục",
    FEATURED_PRODUCTS: "Sản phẩm nổi bật",
    BLOG_GRID: "Tin công nghệ",
    PRODUCT_GRID: "Lưới sản phẩm",
};

const sortByLabel: Record<string, string> = {
    NEWEST: "Mới nhất",
    PRICE_ASC: "Giá tăng dần",
    PRICE_DESC: "Giá giảm dần",
    BEST_SELLING: "Bán chạy",
    PROMOTION: "Khuyến mãi",
};

function StatusBadge({ active }: { active: boolean }) {
    return (
        <Badge variant={active ? "default" : "secondary"}>
            {active ? "Đang bật" : "Đang tắt"}
        </Badge>
    );
}

export default function StaffCmsCollectionDetailPage({ basePath, canDelete = false }: Props) {
    const { collectionId } = useParams();
    const navigate = useNavigate();

    const [collection, setCollection] = useState<CmsCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [openCollectionForm, setOpenCollectionForm] = useState(false);
    const [openSectionForm, setOpenSectionForm] = useState(false);
    const [openItemForm, setOpenItemForm] = useState(false);
    const [openRuleForm, setOpenRuleForm] = useState(false);

    const [selectedSection, setSelectedSection] = useState<CmsSection | null>(null);
    const [selectedItem, setSelectedItem] = useState<CmsSectionItem | null>(null);
    const [selectedRule, setSelectedRule] = useState<CmsCollectionRule | null>(null);
    const [activeSectionId, setActiveSectionId] = useState("");

    const [deleteSection, setDeleteSection] = useState<CmsSection | null>(null);
    const [deleteItem, setDeleteItem] = useState<CmsSectionItem | null>(null);
    const [deleteRule, setDeleteRule] = useState<CmsCollectionRule | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function loadCollection(options?: { silent?: boolean }) {
        if(!collectionId) return;

        try {
            if(!options?.silent) setLoading(true);
            setError("");

            const data = await cmsService.getAdminCollectionDetail(collectionId);
            setCollection(data.collection);
        } catch(error) {
            setError(getErrorMessage(error));
        } finally {
            if(!options?.silent) setLoading(false);
        }
    }

    useEffect(() => {
        loadCollection();
    }, [collectionId]);

    async function handleDeleteSection() {
        if(!deleteSection) return;

        try {
            setDeleting(true);
            await cmsService.removeSection(deleteSection.section_id);
            toast.success("Xóa khu vực thành công.");
            setDeleteSection(null);
            loadCollection({ silent: true });
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    async function handleDeleteItem() {
        if(!deleteItem) return;

        try {
            setDeleting(true);
            await cmsService.removeSectionItem(deleteItem.item_id);
            toast.success("Xóa item thành công.");
            setDeleteItem(null);
            loadCollection({ silent: true });
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    async function handleDeleteRule() {
        if(!deleteRule) return;

        try {
            setDeleting(true);
            await cmsService.removeRule(deleteRule.rule_id);
            toast.success("Xóa quy tắc thành công.");
            setDeleteRule(null);
            loadCollection({ silent: true });
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    if(loading) return <PageLoading text="Đang tải bộ sưu tập CMS..." />;
    if(error) return <FormError message={error} />;
    if(!collection || !collectionId) return <p>Không tìm thấy bộ sưu tập CMS.</p>;

    const sections = collection.cms_sections ?? [];
    const rules = collection.cms_collection_rules ?? [];

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <Button variant="ghost" className="mb-2 px-0 cursor-pointer" onClick={() => navigate(basePath)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">{collection.title}</h1>
                        <StatusBadge active={collection.is_active} />
                    </div>
                    <p className="text-sm text-muted-foreground">/{collection.slug}</p>
                </div>

                <Button className="h-12 cursor-pointer" onClick={() => setOpenCollectionForm(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa bộ sưu tập
                </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-lg border bg-background p-5">
                    <h2 className="text-lg font-semibold">Thông tin chung</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Loại trang</p>
                            <p className="font-medium">{collection.page_type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Thứ tự</p>
                            <p className="font-medium">{collection.sort_order}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Danh mục</p>
                            <p className="font-medium">{collection.categories?.category_name ?? "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Thương hiệu</p>
                            <p className="font-medium">{collection.brands?.brand_name ?? "-"}</p>
                        </div>
                    </div>
                    {collection.description ? (
                        <p className="mt-4 text-sm text-muted-foreground">{collection.description}</p>
                    ) : null}
                </div>

                <div className="rounded-lg border bg-background p-5">
                    <h2 className="text-lg font-semibold">Tóm tắt</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Section</span>
                            <span className="font-medium">{sections.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Rule</span>
                            <span className="font-medium">{rules.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-background p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">Sections</h2>
                    <Button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => {
                            setSelectedSection(null);
                            setOpenSectionForm(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm khu vực
                    </Button>
                </div>

                <div className="mt-4 space-y-4">
                    {sections.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Chưa có khu vực.
                        </div>
                    ) : sections.map((section) => (
                        <div key={section.section_id} className="rounded-lg border p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold">{section.title || sectionTypeLabel[section.section_type]}</h3>
                                        <StatusBadge active={section.is_active} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {sectionTypeLabel[section.section_type] ?? section.section_type} · Thứ tự {section.sort_order}
                                    </p>
                                    {section.href ? <p className="text-sm text-muted-foreground">{section.href}</p> : null}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setActiveSectionId(section.section_id);
                                            setSelectedItem(null);
                                            setOpenItemForm(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm mục
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setSelectedSection(section);
                                            setOpenSectionForm(true);
                                        }}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Sửa
                                    </Button>
                                    {canDelete && (
                                        <Button type="button" variant="destructive" size="sm" className="cursor-pointer" onClick={() => setDeleteSection(section)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Xóa
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                {(section.cms_section_items ?? []).length === 0 ? (
                                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Section này chưa có item.</p>
                                ) : (section.cms_section_items ?? []).map((item) => (
                                    <div key={item.item_id} className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title || "CMS item"} className="h-14 w-14 rounded-md object-cover" />
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                                    Không có ảnh
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-medium">{item.title || item.product_variants?.variant_name || item.products?.product_name || item.blog_posts?.title || "Item chưa đặt tên"}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Thứ tự {item.sort_order} {item.href ? `· ${item.href}` : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setActiveSectionId(section.section_id);
                                                    setSelectedItem(item);
                                                    setOpenItemForm(true);
                                                }}
                                            >
                                                Sửa
                                            </Button>
                                            {canDelete && (
                                                <Button type="button" variant="destructive" size="sm" className="cursor-pointer" onClick={() => setDeleteItem(item)}>
                                                    Xóa
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-lg border bg-background p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold">Rules lấy sản phẩm</h2>
                    <Button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => {
                            setSelectedRule(null);
                            setOpenRuleForm(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm quy tắc
                    </Button>
                </div>

                <div className="mt-4 space-y-3">
                    {rules.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                            Chưa có quy tắc.
                        </div>
                    ) : rules.map((rule) => (
                        <div key={rule.rule_id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">{rule.keyword || rule.attribute_value || rule.brands?.brand_name || rule.categories?.category_name || "Quy tắc lọc sản phẩm"}</p>
                                    <StatusBadge active={rule.is_active} />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {sortByLabel[rule.sort_by] ?? rule.sort_by} · Tối đa {rule.limit} sản phẩm
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSelectedRule(rule);
                                        setOpenRuleForm(true);
                                    }}
                                >
                                    Sửa
                                </Button>
                                {canDelete && (
                                    <Button type="button" variant="destructive" size="sm" className="cursor-pointer" onClick={() => setDeleteRule(rule)}>
                                        Xóa
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CmsCollectionFormDialog
                open={openCollectionForm}
                collection={collection}
                onOpenChange={setOpenCollectionForm}
                onSuccess={() => loadCollection({ silent: true })}
            />
            <CmsSectionFormDialog
                open={openSectionForm}
                collectionId={collectionId}
                section={selectedSection}
                onOpenChange={setOpenSectionForm}
                onSuccess={() => loadCollection({ silent: true })}
            />
            <CmsSectionItemFormDialog
                open={openItemForm}
                sectionId={activeSectionId}
                item={selectedItem}
                onOpenChange={setOpenItemForm}
                onSuccess={() => loadCollection({ silent: true })}
            />
            <CmsRuleFormDialog
                open={openRuleForm}
                collectionId={collectionId}
                rule={selectedRule}
                onOpenChange={setOpenRuleForm}
                onSuccess={() => loadCollection({ silent: true })}
            />

            <ConfirmDeleteDialog
                open={Boolean(deleteSection)}
                loading={deleting}
                title="Xóa khu vực"
                description={`Bạn có chắc muốn xóa khu vực "${deleteSection?.title || deleteSection?.section_type}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteSection(null);
                }}
                onConfirm={handleDeleteSection}
            />
            <ConfirmDeleteDialog
                open={Boolean(deleteItem)}
                loading={deleting}
                title="Xóa item"
                description={`Bạn có chắc muốn xóa item "${deleteItem?.title || "CMS item"}" không?`}
                onOpenChange={(open) => {
                    if(!open) setDeleteItem(null);
                }}
                onConfirm={handleDeleteItem}
            />
            <ConfirmDeleteDialog
                open={Boolean(deleteRule)}
                loading={deleting}
                title="Xóa quy tắc"
                description="Bạn có chắc muốn xóa quy tắc này không?"
                onOpenChange={(open) => {
                    if(!open) setDeleteRule(null);
                }}
                onConfirm={handleDeleteRule}
            />
        </section>
    );
}
