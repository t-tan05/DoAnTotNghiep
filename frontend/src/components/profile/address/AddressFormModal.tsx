import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { addressService } from "@/services/address.service";
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
        ward: "",
        street: "",
        isDefault: initialDefault,
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(!open) return;

        if(mode === "edit" && address){
            setForm({
                receiverName: address.receiver_name,
                phoneNumber: address.phone_number,
                province: address.province,
                ward: address.ward,
                street: address.street,
                isDefault: address.is_default,
            });
            return;
        }

        setForm({
            receiverName: "",
            phoneNumber: "",
            province: "",
            ward: "",
            street: "",
            isDefault: initialDefault,
        });
    }, [open, mode, address, initialDefault]);

    if(!open) return null;

    function updateField(name: keyof typeof form, value: string | boolean) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
            if(mode === "edit" && address){
                await addressService.updateAddress(address.address_id, {
                    receiverName: form.receiverName,
                    phoneNumber: form.phoneNumber,
                    province: form.province,
                    ward: form.ward,
                    street: form.street,
                    isDefault: form.isDefault,
                });
                toast.success("Cập nhật địa chỉ thành công.");
            }else {
                await addressService.createAddress({
                    receiverName: form.receiverName,
                    phoneNumber: form.phoneNumber,
                    province: form.province,
                    ward: form.ward,
                    street: form.street,
                    setDefault: form.isDefault,
                });
                toast.success("Thêm địa chỉ thành công.");
            }

            onSuccess();
            onClose();
        }catch(error){
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    const disableDefaultCheckbox = mode === "edit" && address?.is_default;

    return(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-[680px] flex-col rounded-xl bg-white shadow-xl">
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
                                <span className="mr-1 text-red-500">
                                    *
                                </span> Họ tên
                            </label>
                            <input 
                                id="name"
                                className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                type="text" 
                                placeholder="Họ tên người nhận"
                                value={form.receiverName}
                                onChange={(e) => updateField("receiverName", e.target.value)}
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
                                onChange={(e) => updateField("phoneNumber", e.target.value)}
                                required
                            />
                        </div>

                        <div className="border-t pt-5">
                            <h2 className="mb-5 text-2xl font-bold text-gray-900">
                                Địa chỉ nhận hàng
                            </h2>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label htmlFor="province" className="hover:cursor-pointer mb-2 block font-bold text-gray-900">
                                        <span className="mr-1 text-red-500">*</span> Tỉnh/Thành phố
                                    </label>
                                    <input
                                        id="province"
                                        className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                        placeholder="Tỉnh/Thành phố"
                                        value={form.province}
                                        onChange={(e) => updateField("province", e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="ward" className="hover:cursor-pointer mb-2 block font-bold text-gray-900">
                                        <span className="mr-1 text-red-500">*</span> Phường/Xã
                                    </label>
                                    <input
                                        id="ward"
                                        className="h-14 w-full rounded-lg border border-gray-300 bg-white px-4 text-base outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                        placeholder="Phường/Xã"
                                        value={form.ward}
                                        onChange={(e) => updateField("ward", e.target.value)}
                                        required
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
                                onChange={(e) => updateField("street", e.target.value)}
                                required
                            />
                        </div>

                        <label htmlFor="" className="flex items-center justify-end gap-2 text-sm">
                            <input 
                                type="checkbox" 
                                checked={form.isDefault}
                                disabled={disableDefaultCheckbox}
                                onChange={(e) => updateField("isDefault", e.target.checked)}
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
    )
}