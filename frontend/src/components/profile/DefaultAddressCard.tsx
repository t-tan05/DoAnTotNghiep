import { addressService } from "@/services/address.service";
import type { Address } from "@/types/address.type";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import AddressFormModal from "./address/AddressFormModal";
import PageLoading from "../common/PageLoading";

export default function DefaultAddressCard() {

    const [address, setAddress] = useState<Address | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    async function loadDefaultAddress() {
        setLoading(true);

        try{
            const res = await addressService.getDefaultAddress();
            setAddress(res.data.data.address);
        }catch{
            setAddress(null);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDefaultAddress();
    }, []);

    return(
        <section className="rounded-xl border bg-white p-5 md:p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Địa chỉ mặc định</h2>

                {address && (
                    <button type="button" onClick={() => setModalOpen(true)}>
                        <Pencil className="size-5 text-muted-foreground hover:cursor-pointer"/>
                    </button>
                )}
            </div>

            {loading ? (
                <PageLoading 
                    variant="plain"
                    text="Đang tải địa chỉ mặc định..."
                />
            ) : !address ? (
                <>
                    <p className="mt-5 text-sm leading-6 text-muted-foreground">
                        Bạn chưa có địa chỉ nhận hàng mặc định. Vui lòng chọn thêm địa chỉ nhận hàng.
                    </p>

                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="mt-5 flex items-center gap-2 border-t pt-5 text-sm font-medium text-blue-700"
                    >
                        <Plus className="size-4" />
                        Thêm địa chỉ nhận hàng
                    </button>
                </>
            ): (
                <div className="mt-5 space-y-3">
                    <div>
                        <p className="text-sm font-medium">Tỉnh/Thành phố</p>
                        <div className="mt-1 rounded-lg border bg-muted px-3 py-2 text-sm hover:cursor-pointer">
                            {address.province}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium">Phường/Xã</p>
                        <div className="mt-1 rounded-lg border bg-muted px-3 py-2 text-sm hover:cursor-pointer">
                            {address.ward}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium">Địa chỉ cụ thể</p>
                        <div className="mt-1 rounded-lg border bg-muted px-3 py-2 text-sm hover:cursor-pointer">
                            {address.street}
                        </div>
                    </div>
                </div>
            )}
            
            <AddressFormModal
                open={modalOpen}
                mode={address ? "edit" : "create"}
                address={address}
                initialDefault
                onClose={() => setModalOpen(false)}
                onSuccess={loadDefaultAddress}
            />
        </section>
    )
}