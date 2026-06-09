import AddressFormModal from "@/components/profile/address/AddressFormModal";
import { addressService } from "@/services/address.service";
import type { Address } from "@/types/address.type";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import PageLoading from "@/components/common/PageLoading";
import { getErrorMessage } from "@/utils/getErrorMessage";
import SpinnerButton from "@/components/common/SpinnerButton";

export default function AddressPage() {
    const [addresses, setAddress] = useState<Address[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function loadAddresses() {
        setLoading(true);
        setError("");

        try{
            const res = await addressService.getAddresses();
            setAddress(res.data.data.addresses || []);
        }catch(error){
            setAddress([]);
            setError(getErrorMessage(error))
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAddresses();
    }, []);

    function openCreate() {
        setEditingAddress(null);
        setModalOpen(true);
    }

    function openEdit(address: Address) {
        setEditingAddress(address);
        setModalOpen(true);
    }

    async function handleDelete(addressId: string) {

        setDeletingId(addressId);
        try{
            await addressService.deleteAddress(addressId);
            await loadAddresses();
        }catch(error){
            setError(getErrorMessage(error));
        }finally{
            setDeletingId(null);
        }
    }

    return (
        <section className="min-w-0">
            <h1 className="text-2xl font-bold">Sổ địa chỉ</h1>

            <button
                type="button"
                onClick={openCreate}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-dashed bg-white text-sm font-medium text-blue-700 cursor-pointer"
            >
                <Plus className="size-5" />
                Thêm địa chỉ mới
            </button>

            <div className="mt-5 space-y-4">
                {loading && (
                    <PageLoading text="Đang tải danh sách địa chỉ..." />
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && addresses.length === 0 && (
                    <div className="rounded-xl border bg-white p-6 text-center text-sm text-muted-foreground">
                        Bạn chưa có địa chỉ nào.
                    </div>
                )}

                {!loading && !error && addresses.map((address) => (
                    <div key={address.address_id} className="rounded-xl border bg-white p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{address.receiver_name}</p>

                                    {address.is_default && (
                                        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">MẶC ĐỊNH</span>
                                    )}
                                </div>

                                <p className="mt-2 break-words text-sm text-muted-foreground">
                                    Địa chỉ: {address.street}, {address.ward}, {address.province}
                                </p>

                                <p className="mt-2 break-words text-sm text-muted-foreground">
                                    Điện thoại: {address.phone_number}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => openEdit(address)}
                                    className="h-9 rounded-lg border border-red-500 px-4 text-sm text-red-600 cursor-pointer"
                                >
                                    Chỉnh sửa
                                </button>

                                {!address.is_default && (
                                    <SpinnerButton
                                        type="button"
                                        loading={deletingId === address.address_id}
                                        loadingText="Đang xóa..."
                                        onClick={() => handleDelete(address.address_id)}
                                        className="h-9 rounded-lg border bg-white px-4 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer"
                                    >
                                        Xóa
                                    </SpinnerButton>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AddressFormModal 
                open={modalOpen}
                mode={editingAddress ? "edit" : "create"}
                address={editingAddress}
                initialDefault={false}
                onClose={() => setModalOpen(false)}
                onSuccess={loadAddresses}
            />
        </section>
    )
}