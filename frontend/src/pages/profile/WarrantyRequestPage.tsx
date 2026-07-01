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
import type { WarrantyLookupResponse, WarrantyServiceMethod } from "@/types/warranty.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { CheckCircle2, PackageCheck, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function formatDate(value?: string | null) {
    if(!value) return "-";
    return new Date(value).toLocaleDateString("vi-VN");
}

function getVariantImage(lookup: WarrantyLookupResponse) {
    if(!lookup.isValid) return "";

    return (
        lookup.variant.image_url ||
        lookup.variant.product_images?.find((image) => image.is_default)?.image_url ||
        lookup.variant.product_images?.[0]?.image_url ||
        ""
    );
}

export default function WarrantyRequestPage() {
    const navigate = useNavigate();

    const [serialNumber, setSerialNumber] = useState("");
    const [lookup, setLookup] = useState<WarrantyLookupResponse | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [serviceMethod, setServiceMethod] = useState<WarrantyServiceMethod>("PICKUP");
    const [issueDescription, setIssueDescription] = useState("");
    const [pickupReceiverName, setPickupReceiverName] = useState("");
    const [pickupPhone, setPickupPhone] = useState("");
    const [pickupAddress, setPickupAddress] = useState("");
    const [note, setNote] = useState("");

    async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!serialNumber.trim()) {
            toast.error("Vui lòng nhập serial của thiết bị.");
            return;
        }

        try {
            setLookupLoading(true);
            const data = await warrantyService.lookupBySerial(serialNumber.trim());
            setLookup(data);

            if(data.isValid) {
                toast.success(data.message);
                return;
            }

            toast.error(data.message);
        } catch(error) {
            setLookup(null);
            toast.error(getErrorMessage(error));
        } finally {
            setLookupLoading(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!lookup?.isValid) {
            toast.error("Vui lòng kiểm tra serial hợp lệ trước khi gửi yêu cầu.");
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
                serialNumber: lookup.serialNumber,
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

    const imageUrl = lookup ? getVariantImage(lookup) : "";

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Yêu cầu bảo hành</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kiểm tra serial thiết bị trước, sau đó gửi mô tả lỗi để nhân viên tiếp nhận.
                    </p>
                </div>

                <Button asChild variant="outline" className="cursor-pointer">
                    <Link to="/account/warranties">Phiếu bảo hành của tôi</Link>
                </Button>
            </div>

            <div className="rounded-xl border bg-white p-4 md:p-5">
                <form onSubmit={handleLookup} className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <div>
                        <Label htmlFor="serialNumber">Serial thiết bị</Label>
                        <Input
                            id="serialNumber"
                            value={serialNumber}
                            onChange={(event) => setSerialNumber(event.target.value)}
                            placeholder="Nhập serial/IMEI của thiết bị"
                            className="mt-2 h-11"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={lookupLoading}
                        className="h-11 cursor-pointer self-end"
                    >
                        <Search className="size-4" />
                        {lookupLoading ? "Đang kiểm tra..." : "Kiểm tra"}
                    </Button>
                </form>

                {lookupLoading && <PageLoading text="Đang kiểm tra serial..." />}

                {!lookupLoading && lookup && (
                    <div
                        className={[
                            "mt-4 rounded-xl border p-4",
                            lookup.isValid ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60",
                        ].join(" ")}
                    >
                        <div className="flex items-start gap-3">
                            <PackageCheck className={lookup.isValid ? "mt-0.5 size-5 text-emerald-700" : "mt-0.5 size-5 text-red-700"} />
                            <div>
                                <p className={lookup.isValid ? "font-semibold text-emerald-800" : "font-semibold text-red-700"}>
                                    {lookup.message}
                                </p>
                                {lookup.isValid && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Hạn bảo hành đến {formatDate(lookup.warrantyEndDate)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {lookup.isValid && (
                            <div className="mt-4 grid gap-4 rounded-lg border bg-white p-3 sm:grid-cols-[88px_1fr]">
                                <div className="overflow-hidden rounded-lg border bg-muted">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={lookup.variant.variant_name || lookup.product.product_name} className="aspect-square w-full object-cover" />
                                    ) : (
                                        <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">No image</div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="font-semibold">{lookup.variant.variant_name || lookup.product.product_name}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">SKU: {lookup.variant.sku || "-"}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Serial: {lookup.serialNumber}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Thương hiệu: {lookup.product.brands?.brand_name || "-"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {lookup?.isValid && (
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
