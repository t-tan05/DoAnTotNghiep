import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import {
    addressService,
    type DistrictOption,
    type ProvinceOption,
    type WardOption,
} from "@/services/address.service";
import type { Address } from "@/types/address.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AddressFormModalProps = {
    open: boolean;
    mode: "create" | "edit";
    initialDefault?: boolean;
    address?: Address | null;
    onClose: () => void;
    onSuccess: () => void;
};

type SearchableOption = {
    code: number | string;
    name: string;
};

type SearchableSelectProps = {
    id: string;
    value: string;
    placeholder: string;
    disabled?: boolean;
    options: SearchableOption[];
    onSearchChange?: () => void;
    onSelect: (option: SearchableOption) => void;
};

function SearchableSelect({
    id,
    value,
    placeholder,
    disabled = false,
    options,
    onSearchChange,
    onSelect,
}: SearchableSelectProps) {
    const [keyword, setKeyword] = useState(value);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setKeyword(value);
    }, [value]);

    const searchText = keyword.trim().toLowerCase();
    const filteredOptions = options
        .filter((item) => item.name.toLowerCase().includes(searchText))
        .slice(0, 20);

    return (
        <div className="relative">
            <input
                id={id}
                className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                value={keyword}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
                required
                onFocus={() => setOpen(true)}
                onChange={(event) => {
                    setKeyword(event.target.value);
                    setOpen(true);
                    onSearchChange?.();
                }}
                onBlur={() => {
                    setTimeout(() => setOpen(false), 150);
                }}
            />

            {open && !disabled && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={String(option.code)}
                                type="button"
                                className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                    onSelect(option);
                                    setKeyword(option.name);
                                    setOpen(false);
                                }}
                            >
                                {option.name}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            Không tìm thấy kết quả
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function AddressFormModal({
    open,
    mode,
    initialDefault = false,
    address,
    onClose,
    onSuccess,
}: AddressFormModalProps) {
    const [form, setForm] = useState({
        receiverName: "",
        phoneNumber: "",
        province: "",
        district: "",
        ward: "",
        street: "",
        ghnProvinceId: 0,
        ghnLegacyDistrictId: 0,
        ghnWardCode: "",
        isDefault: initialDefault,
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
    const [districts, setDistricts] = useState<DistrictOption[]>([]);
    const [wards, setWards] = useState<WardOption[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    useEffect(() => {
        if(!open) return;

        async function fetchProvinces() {
            setLoadingProvinces(true);

            try {
                const data = await addressService.getGhnProvinces();
                setProvinces(data);
            } catch {
                toast.error("Không thể tải danh sách tỉnh/thành phố.");
            } finally {
                setLoadingProvinces(false);
            }
        }

        fetchProvinces();
    }, [open]);

    useEffect(() => {
        if(!open || !form.ghnProvinceId) {
            setDistricts([]);
            return;
        }

        async function fetchDistricts() {
            setLoadingDistricts(true);

            try {
                const data = await addressService.getGhnDistricts(form.ghnProvinceId);
                setDistricts(data);
            } catch {
                toast.error("Không thể tải danh sách quận/huyện.");
            } finally {
                setLoadingDistricts(false);
            }
        }

        fetchDistricts();
    }, [open, form.ghnProvinceId]);

    useEffect(() => {
        if(!open || !form.ghnLegacyDistrictId) {
            setWards([]);
            return;
        }

        async function fetchWards() {
            setLoadingWards(true);

            try {
                const data = await addressService.getGhnWards(form.ghnLegacyDistrictId);
                setWards(data);
            } catch {
                toast.error("Không thể tải danh sách phường/xã.");
            } finally {
                setLoadingWards(false);
            }
        }

        fetchWards();
    }, [open, form.ghnLegacyDistrictId]);

    useEffect(() => {
        if(!open) return;

        setDistricts([]);
        setWards([]);
        setError("");

        if(mode === "edit" && address) {
            setForm({
                receiverName: address.receiver_name,
                phoneNumber: address.phone_number,
                province: address.province,
                district: address.district,
                ward: address.ward,
                street: address.street,
                ghnProvinceId: Number(address.ghn_province_id || 0),
                ghnLegacyDistrictId: Number(address.ghn_legacy_district_id || 0),
                ghnWardCode: address.ghn_ward_code || "",
                isDefault: address.is_default,
            });
            return;
        }

        setForm({
            receiverName: "",
            phoneNumber: "",
            province: "",
            district: "",
            ward: "",
            street: "",
            ghnProvinceId: 0,
            ghnLegacyDistrictId: 0,
            ghnWardCode: "",
            isDefault: initialDefault,
        });
    }, [open, mode, address, initialDefault]);

    if(!open) return null;

    function updateField(name: keyof typeof form, value: string | number | boolean) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleProvinceSearchChange() {
        updateField("province", "");
        updateField("district", "");
        updateField("ward", "");
        updateField("ghnProvinceId", 0);
        updateField("ghnLegacyDistrictId", 0);
        updateField("ghnWardCode", "");
        setDistricts([]);
        setWards([]);
    }

    function handleProvinceSelect(province: SearchableOption) {
        updateField("province", province.name);
        updateField("district", "");
        updateField("ward", "");
        updateField("ghnProvinceId", Number(province.code));
        updateField("ghnLegacyDistrictId", 0);
        updateField("ghnWardCode", "");
        setWards([]);
    }

    function handleDistrictSearchChange() {
        updateField("district", "");
        updateField("ward", "");
        updateField("ghnLegacyDistrictId", 0);
        updateField("ghnWardCode", "");
        setWards([]);
    }

    function handleDistrictSelect(district: SearchableOption) {
        updateField("district", district.name);
        updateField("ward", "");
        updateField("ghnLegacyDistrictId", Number(district.code));
        updateField("ghnWardCode", "");
    }

    function handleWardSearchChange() {
        updateField("ward", "");
        updateField("ghnWardCode", "");
    }

    function handleWardSelect(ward: SearchableOption) {
        updateField("ward", ward.name);
        updateField("ghnWardCode", String(ward.code));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if(
            !form.province ||
            !form.district ||
            !form.ward ||
            !form.ghnProvinceId ||
            !form.ghnLegacyDistrictId ||
            !form.ghnWardCode
        ) {
            setError("Vui lòng chọn tỉnh/thành phố, quận/huyện và phường/xã từ danh sách gợi ý.");
            return;
        }

        setLoading(true);

        try {
            if(mode === "edit" && address) {
                await addressService.updateAddress(address.address_id, {
                    receiverName: form.receiverName,
                    phoneNumber: form.phoneNumber,
                    province: form.province,
                    district: form.district,
                    ward: form.ward,
                    street: form.street,
                    isDefault: form.isDefault,
                    ghnProvinceId: form.ghnProvinceId,
                    ghnLegacyDistrictId: form.ghnLegacyDistrictId,
                    ghnWardCode: form.ghnWardCode,
                });
                toast.success("Cập nhật địa chỉ thành công.");
            } else {
                await addressService.createAddress({
                    receiverName: form.receiverName,
                    phoneNumber: form.phoneNumber,
                    province: form.province,
                    district: form.district,
                    ward: form.ward,
                    street: form.street,
                    ghnProvinceId: form.ghnProvinceId,
                    ghnLegacyDistrictId: form.ghnLegacyDistrictId,
                    ghnWardCode: form.ghnWardCode,
                    setDefault: form.isDefault,
                });
                toast.success("Thêm địa chỉ thành công.");
            }

            onSuccess();
            onClose();
        } catch(error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    const disableDefaultCheckbox = mode === "edit" && address?.is_default;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-[760px] flex-col rounded-xl bg-white shadow-xl">
                <div className="flex shrink-0 items-center justify-between px-6 py-6 md:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Thông tin người nhận hàng</h2>

                    <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
                        <X className="size-6 hover:cursor-pointer" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pb-6 md:px-8">
                        <FormError message={error} />

                        <div>
                            <label htmlFor="name" className="hover:cursor-pointer mb-2 block font-bold text-gray-900">
                                <span className="mr-1 text-red-500">*</span> Họ tên
                            </label>
                            <input
                                id="name"
                                className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                type="text"
                                placeholder="Họ tên người nhận"
                                value={form.receiverName}
                                onChange={(event) => updateField("receiverName", event.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="hover:cursor-pointer mb-2 block font-bold text-gray-900">
                                <span className="mr-1 text-red-500">*</span> Số điện thoại
                            </label>
                            <input
                                id="phoneNumber"
                                className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                type="text"
                                placeholder="Số điện thoại"
                                value={form.phoneNumber}
                                onChange={(event) => updateField("phoneNumber", event.target.value)}
                                required
                            />
                        </div>

                        <div className="border-t pt-5">
                            <h2 className="mb-5 text-2xl font-bold text-gray-900">
                                Địa chỉ nhận hàng
                            </h2>

                            <div className="grid gap-5 md:grid-cols-3">
                                <div>
                                    <label htmlFor="province" className="hover:cursor-pointer mb-2 block font-bold text-gray-900">
                                        <span className="mr-1 text-red-500">*</span> Tỉnh/Thành phố
                                    </label>
                                    <SearchableSelect
                                        id="province"
                                        value={form.province}
                                        placeholder={loadingProvinces ? "Đang tải tỉnh/thành phố..." : "Nhập tỉnh/thành phố"}
                                        disabled={loadingProvinces}
                                        options={provinces}
                                        onSearchChange={handleProvinceSearchChange}
                                        onSelect={handleProvinceSelect}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="district" className="hover:cursor-pointer mb-2 block font-bold text-gray-900">
                                        <span className="mr-1 text-red-500">*</span> Quận/Huyện
                                    </label>
                                    <SearchableSelect
                                        id="district"
                                        value={form.district}
                                        placeholder={
                                            !form.ghnProvinceId
                                                ? "Chọn tỉnh/thành phố trước"
                                                : loadingDistricts
                                                    ? "Đang tải quận/huyện..."
                                                    : "Nhập quận/huyện"
                                        }
                                        disabled={!form.ghnProvinceId || loadingDistricts}
                                        options={districts}
                                        onSearchChange={handleDistrictSearchChange}
                                        onSelect={handleDistrictSelect}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="ward" className="hover:cursor-pointer mb-2 block font-bold text-gray-900">
                                        <span className="mr-1 text-red-500">*</span> Phường/Xã
                                    </label>
                                    <SearchableSelect
                                        id="ward"
                                        value={form.ward}
                                        placeholder={
                                            !form.ghnLegacyDistrictId
                                                ? "Chọn quận/huyện trước"
                                                : loadingWards
                                                    ? "Đang tải phường/xã..."
                                                    : "Nhập phường/xã"
                                        }
                                        disabled={!form.ghnLegacyDistrictId || loadingWards}
                                        options={wards}
                                        onSearchChange={handleWardSearchChange}
                                        onSelect={handleWardSelect}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="street" className="hover:cursor-pointer mb-2 block font-bold text-gray-900">
                                <span className="mr-1 text-red-500">*</span> Địa chỉ cụ thể
                            </label>
                            <input
                                id="street"
                                className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                type="text"
                                placeholder="Số nhà, ngõ, tên đường..."
                                value={form.street}
                                onChange={(event) => updateField("street", event.target.value)}
                                required
                            />
                        </div>

                        <label className="flex items-center justify-end gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isDefault}
                                disabled={disableDefaultCheckbox}
                                onChange={(event) => updateField("isDefault", event.target.checked)}
                            />
                            Đặt làm mặc định
                        </label>
                    </div>

                    <div className="flex shrink-0 justify-end gap-3 px-6 py-5 md:px-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-12 rounded-lg border border-blue-700 px-7 text-base font-medium text-blue-700 hover:bg-blue-50 hover:cursor-pointer"
                        >
                            Hủy bỏ
                        </button>

                        <SpinnerButton
                            type="submit"
                            loading={loading}
                            loadingText="Đang lưu..."
                            className="h-12 rounded-lg bg-blue-700 px-7 text-base font-semibold text-white hover:bg-blue-800 hover:cursor-pointer"
                        >
                            Lưu địa chỉ
                        </SpinnerButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
