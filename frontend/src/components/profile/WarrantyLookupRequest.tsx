import PageLoading from "@/components/common/PageLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { warrantyService } from "@/services/warranty.service";
import type {
    WarrantyLookupResponse,
    WarrantyPhoneLookupItem,
    WarrantyPhoneLookupResponse,
    WarrantyServiceMethod,
    WarrantyVariant,
} from "@/types/warranty.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { CheckCircle2, PackageCheck, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type LookupMode = "phone" | "serial";

function formatDate(value?: string | null) {
    if(!value) return "-";
    return new Date(value).toLocaleDateString("vi-VN");
}

function getVariantImage(variant?: WarrantyVariant | null) {
    if(!variant) return "";

    return (
        variant.image_url ||
        variant.product_images?.find((image) => image.is_default)?.image_url ||
        variant.product_images?.[0]?.image_url ||
        ""
    );
}

function getSerialLookupSummary(lookup: WarrantyLookupResponse | null) {
    if(!lookup?.isValid) return null;

    return {
        deviceId: lookup.deviceId,
        serialNumber: lookup.serialNumber,
        warrantyEndDate: lookup.warrantyEndDate,
        message: lookup.message,
        product: lookup.product,
        variant: lookup.variant,
    };
}

export default function WarrantyLookupRequest() {
    const navigate = useNavigate();

    const [lookupMode, setLookupMode] = useState<LookupMode>("phone");
    const [keyword, setKeyword] = useState("");
    const [serialLookup, setSerialLookup] = useState<WarrantyLookupResponse | null>(null);
    const [phoneLookup, setPhoneLookup] = useState<WarrantyPhoneLookupResponse | null>(null);
    const [selectedItem, setSelectedItem] = useState<WarrantyPhoneLookupItem | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [serviceMethod, setServiceMethod] = useState<WarrantyServiceMethod>("PICKUP");
    const [issueDescription, setIssueDescription] = useState("");
    const [pickupReceiverName, setPickupReceiverName] = useState("");
    const [pickupPhone, setPickupPhone] = useState("");
    const [pickupAddress, setPickupAddress] = useState("");
    const [note, setNote] = useState("");

    const serialSummary = getSerialLookupSummary(serialLookup);
    const selectedSummary = selectedItem?.isValid ? selectedItem : null;
    const canCreateWarranty = Boolean(serialSummary || selectedSummary);
    const activeVariant = selectedSummary?.variant || serialSummary?.variant || null;
    const activeProduct = selectedSummary?.product || serialSummary?.product || null;
    const activeImage = getVariantImage(activeVariant);
    const activeSerialNumber = selectedSummary?.serialNumber || serialSummary?.serialNumber;
    const activeWarrantyEndDate = selectedSummary?.warrantyEndDate || serialSummary?.warrantyEndDate;

    function resetLookupResult() {
        setSerialLookup(null);
        setPhoneLookup(null);
        setSelectedItem(null);
    }

    async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const value = keyword.trim();

        if(!value) {
            toast.error(lookupMode === "phone" ? "Vui lòng nhập số điện thoại." : "Vui lòng nhập serial/IMEI.");
            return;
        }

        try {
            setLookupLoading(true);
            resetLookupResult();

            if(lookupMode === "phone") {
                const data = await warrantyService.lookupByPhone(value);
                setPhoneLookup(data);

                if(data.items.length) {
                    toast.success(data.message);
                    return;
                }

                toast.error(data.message);
                return;
            }

            const data = await warrantyService.lookupBySerial(value);
            setSerialLookup(data);

            if(data.isValid) {
                toast.success(data.message);
                return;
            }

            toast.error(data.message);
        } catch(error) {
            resetLookupResult();
            toast.error(getErrorMessage(error));
        } finally {
            setLookupLoading(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!canCreateWarranty) {
            toast.error("Vui lòng chọn sản phẩm còn hạn bảo hành trước khi gửi yêu cầu.");
            return;
        }

        if(!issueDescription.trim()) {
            toast.error("Vui lòng mô tả lỗi của thiết bị.");
            return;
        }

        if(serviceMethod === "PICKUP" && (!pickupReceiverName.trim() || !pickupPhone.trim() || !pickupAddress.trim())) {
            toast.error("Vui lòng nhập đủ thông tin để nhân viên/shipper lấy máy.");
            return;
        }

        try {
            setSubmitting(true);
            const data = await warrantyService.create({
                deviceId: selectedSummary?.deviceId || undefined,
                serialNumber: serialSummary?.serialNumber || undefined,
                issueDescription: issueDescription.trim(),
                serviceMethod,
                pickupReceiverName: pickupReceiverName.trim() || undefined,
                pickupPhone: pickupPhone.trim() || undefined,
                pickupAddress: pickupAddress.trim() || undefined,
                note: note.trim() || undefined,
            });

            toast.success("Đã tạo yêu cầu bảo hành.");
            navigate(`/account/warranties/${data.warranty.warranty_id}`);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tra cứu thông tin bảo hành</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tra theo số điện thoại mua hàng hoặc serial/IMEI của thiết bị, sau đó chọn sản phẩm cần bảo hành.
                    </p>
                </div>

                <Button asChild variant="outline" className="cursor-pointer">
                    <Link to="/account/warranties">Phiếu bảo hành của tôi</Link>
                </Button>
            </div>

            <div className="rounded-xl border bg-muted/30 p-5 md:p-8">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-center text-2xl font-semibold md:text-3xl">
                        Tra Cứu Thông Tin Bảo Hành
                    </h2>

                    <div className="mt-5 grid gap-4 text-base sm:grid-cols-2">
                        <label className="flex cursor-pointer items-center justify-center gap-2">
                            <input
                                type="radio"
                                name="lookupMode"
                                checked={lookupMode === "phone"}
                                onChange={() => {
                                    setLookupMode("phone");
                                    setKeyword("");
                                    resetLookupResult();
                                }}
                                className="size-4 accent-sky-500"
                            />
                            <span>Tra theo số điện thoại</span>
                        </label>

                        <label className="flex cursor-pointer items-center justify-center gap-2">
                            <input
                                type="radio"
                                name="lookupMode"
                                checked={lookupMode === "serial"}
                                onChange={() => {
                                    setLookupMode("serial");
                                    setKeyword("");
                                    resetLookupResult();
                                }}
                                className="size-4 accent-sky-500"
                            />
                            <span>Tra theo mã serial/IMEI</span>
                        </label>
                    </div>

                    <form onSubmit={handleLookup} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                        <Input
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder={lookupMode === "phone" ? "Nhập số điện thoại mua hàng" : "Nhập serial/IMEI của thiết bị"}
                            className="h-12 bg-white"
                        />

                        <Button type="submit" disabled={lookupLoading} className="h-12 min-w-36 cursor-pointer">
                            <Search className="size-4" />
                            {lookupLoading ? "Đang kiểm tra..." : "Kiểm tra"}
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Tổng đài hỗ trợ bảo hành: <span className="font-semibold text-foreground">0909493175</span>
                    </p>
                </div>
            </div>

            {lookupLoading && <PageLoading text="Đang kiểm tra thông tin bảo hành..." />}

            {!lookupLoading && serialLookup && (
                <div
                    className={[
                        "rounded-xl border p-4",
                        serialLookup.isValid ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60",
                    ].join(" ")}
                >
                    <div className="flex items-start gap-3">
                        <PackageCheck className={serialLookup.isValid ? "mt-0.5 size-5 text-emerald-700" : "mt-0.5 size-5 text-red-700"} />
                        <div>
                            <p className={serialLookup.isValid ? "font-semibold text-emerald-800" : "font-semibold text-red-700"}>
                                {serialLookup.message}
                            </p>
                            {serialLookup.isValid && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Hạn bảo hành đến {formatDate(serialLookup.warrantyEndDate)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!lookupLoading && phoneLookup && (
                <div className="rounded-xl border bg-white p-4 md:p-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold">Sản phẩm tìm thấy</h2>
                        <p className="text-sm text-muted-foreground">{phoneLookup.items.length} sản phẩm</p>
                    </div>

                    {phoneLookup.items.length ? (
                        <div className="mt-4 grid gap-3">
                            {phoneLookup.items.map((item, index) => {
                                const imageUrl = getVariantImage(item.variant);
                                const disabled = !item.isValid || !item.deviceId;
                                const selected = selectedItem?.deviceId === item.deviceId && item.deviceId;

                                return (
                                    <button
                                        key={`${item.orderDetailId}-${item.deviceId || index}`}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setSelectedItem(item)}
                                        className={[
                                            "grid gap-3 rounded-xl border p-3 text-left transition sm:grid-cols-[80px_1fr_auto]",
                                            selected ? "border-blue-600 bg-blue-50" : "border-border bg-white",
                                            disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-blue-500",
                                        ].join(" ")}
                                    >
                                        <div className="overflow-hidden rounded-lg border bg-muted">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={item.variant.variant_name || item.product.product_name} className="aspect-square w-full object-cover" />
                                            ) : (
                                                <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">Không có ảnh</div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-semibold">{item.variant.variant_name || item.product.product_name}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">SKU: {item.variant.sku || "-"}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">Serial/IMEI: {item.serialNumber || "Chưa có serial"}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">Hạn bảo hành: {formatDate(item.warrantyEndDate)}</p>
                                            <p className={item.isValid ? "mt-2 text-sm text-emerald-700" : "mt-2 text-sm text-red-600"}>
                                                {item.message}
                                            </p>
                                        </div>

                                        <div className="self-center text-sm font-semibold text-blue-600">
                                            {selected ? "Đã chọn" : item.isValid ? "Chọn" : "Không thể chọn"}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                            Không tìm thấy sản phẩm đã mua bằng số điện thoại này.
                        </div>
                    )}
                </div>
            )}

            {canCreateWarranty && activeProduct && activeVariant && (
                <div className="rounded-xl border bg-white p-4 md:p-5">
                    <div className="flex items-start gap-3">
                        <PackageCheck className="mt-0.5 size-5 text-emerald-700" />
                        <div>
                            <p className="font-semibold text-emerald-800">Sản phẩm đã sẵn sàng tạo phiếu bảo hành.</p>
                            <p className="mt-1 text-sm text-muted-foreground">Hạn bảo hành đến {formatDate(activeWarrantyEndDate)}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 rounded-lg border bg-white p-3 sm:grid-cols-[88px_1fr]">
                        <div className="overflow-hidden rounded-lg border bg-muted">
                            {activeImage ? (
                                <img src={activeImage} alt={activeVariant.variant_name || activeProduct.product_name} className="aspect-square w-full object-cover" />
                            ) : (
                                <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">Không có ảnh</div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="font-semibold">{activeVariant.variant_name || activeProduct.product_name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">SKU: {activeVariant.sku || "-"}</p>
                            <p className="mt-1 text-sm text-muted-foreground">Serial/IMEI: {activeSerialNumber || "-"}</p>
                            <p className="mt-1 text-sm text-muted-foreground">Thương hiệu: {activeProduct.brands?.brand_name || "-"}</p>
                        </div>
                    </div>
                </div>
            )}

            {canCreateWarranty && (
                <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-4 md:p-5">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold">Thông tin yêu cầu</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Label htmlFor="issueDescription">Mô tả lỗi</Label>
                            <Textarea
                                id="issueDescription"
                                value={issueDescription}
                                onChange={(event) => setIssueDescription(event.target.value)}
                                placeholder="Ví dụ: máy không lên nguồn, loa rè, màn hình chớp..."
                                className="mt-2 min-h-28"
                            />
                        </div>

                        <div>
                            <Label>Hình thức gửi máy</Label>
                            <Select value={serviceMethod} onValueChange={(value) => setServiceMethod(value as WarrantyServiceMethod)}>
                                <SelectTrigger className="mt-2 h-11 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PICKUP">Nhân viên/shipper đến lấy máy</SelectItem>
                                    <SelectItem value="DROP_OFF">Tôi mang máy tới cửa hàng</SelectItem>
                                    <SelectItem value="SHIPPING">Tôi tự gửi qua đơn vị vận chuyển</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="note">Ghi chú thêm</Label>
                            <Input
                                id="note"
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="Thời gian liên hệ, phụ kiện kèm theo..."
                                className="mt-2 h-11"
                            />
                        </div>

                        {serviceMethod === "PICKUP" && (
                            <>
                                <div>
                                    <Label htmlFor="pickupReceiverName">Người gửi máy</Label>
                                    <Input
                                        id="pickupReceiverName"
                                        value={pickupReceiverName}
                                        onChange={(event) => setPickupReceiverName(event.target.value)}
                                        className="mt-2 h-11"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="pickupPhone">Số điện thoại</Label>
                                    <Input
                                        id="pickupPhone"
                                        value={pickupPhone}
                                        onChange={(event) => setPickupPhone(event.target.value)}
                                        className="mt-2 h-11"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="pickupAddress">Địa chỉ lấy máy</Label>
                                    <Textarea
                                        id="pickupAddress"
                                        value={pickupAddress}
                                        onChange={(event) => setPickupAddress(event.target.value)}
                                        placeholder="Nhập địa chỉ đầy đủ để nhân viên/shipper đến lấy máy"
                                        className="mt-2"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={submitting} className="h-11 cursor-pointer">
                            {submitting ? "Đang gửi..." : "Gửi yêu cầu bảo hành"}
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}
