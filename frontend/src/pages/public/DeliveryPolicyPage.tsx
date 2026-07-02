import { CheckCircle2, Clock3, MapPin, PackageCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const deliverySteps = [
    "Hệ thống ghi nhận đơn hàng sau khi khách hoàn tất đặt hàng.",
    "Nhân viên kiểm tra tồn kho, serial thiết bị và xác nhận đơn hàng.",
    "Đơn hàng được đóng gói, niêm phong và bàn giao cho đơn vị giao hàng hoặc nhân viên giao nội bộ.",
    "Khách kiểm tra thông tin người nhận, tình trạng hộp và phụ kiện trước khi nhận hàng.",
    "Sau khi giao thành công, hệ thống cập nhật trạng thái đơn hàng và kích hoạt thời hạn bảo hành theo sản phẩm.",
];

export default function DeliveryPolicyPage() {
    return (
        <section className="bg-muted/40 py-8 md:py-10">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <div className="mb-5 text-sm text-muted-foreground">
                    <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
                    <span className="px-2">/</span>
                    <span>Chính sách giao hàng</span>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm md:p-8">
                    <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                        <Truck className="size-4" />
                        Giao hàng toàn quốc
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Chính sách giao hàng</h1>
                    <p className="mt-3 max-w-3xl text-muted-foreground">
                        Chính sách giao hàng áp dụng cho đơn mua online và đơn được nhân viên hỗ trợ lên đơn tại cửa hàng.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <Truck className="size-6 text-blue-700" />
                            <h2 className="mt-3 font-semibold">Giao tận nơi</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Hỗ trợ giao hàng theo địa chỉ khách đã chọn khi thanh toán.</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <PackageCheck className="size-6 text-blue-700" />
                            <h2 className="mt-3 font-semibold">Đóng gói an toàn</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Sản phẩm được kiểm tra, đóng gói và niêm phong trước khi bàn giao.</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <Clock3 className="size-6 text-blue-700" />
                            <h2 className="mt-3 font-semibold">Cập nhật trạng thái</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Khách có thể theo dõi trạng thái đơn trong mục Quản lý đơn hàng.</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
                        <aside className="h-fit rounded-lg border bg-muted/30 p-4 text-sm lg:sticky lg:top-24">
                            <p className="font-semibold">Nội dung chính</p>
                            <div className="mt-3 space-y-2 text-muted-foreground">
                                <a href="#area" className="block hover:text-blue-700">1. Phạm vi giao hàng</a>
                                <a href="#fee" className="block hover:text-blue-700">2. Phí giao hàng</a>
                                <a href="#time" className="block hover:text-blue-700">3. Thời gian giao</a>
                                <a href="#process" className="block hover:text-blue-700">4. Quy trình giao</a>
                                <a href="#receive" className="block hover:text-blue-700">5. Kiểm tra khi nhận</a>
                            </div>
                        </aside>

                        <div className="space-y-8">
                            <section id="area">
                                <h2 className="text-xl font-bold">1. Phạm vi giao hàng</h2>
                                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                    Cửa hàng hỗ trợ giao hàng toàn quốc. Với khu vực nội thành hoặc gần cửa hàng, đơn hàng có thể được giao bởi nhân viên nội bộ. Các khu vực khác sẽ giao qua đơn vị vận chuyển đối tác.
                                </p>
                            </section>

                            <section id="fee">
                                <h2 className="text-xl font-bold">2. Phí giao hàng</h2>
                                <div className="mt-4 overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">Đơn từ 5 triệu</td>
                                                <td className="p-3">Miễn phí giao hàng tiêu chuẩn.</td>
                                            </tr>
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">Đơn dưới 5 triệu</td>
                                                <td className="p-3">Phí giao hàng được thông báo trước khi xác nhận đơn.</td>
                                            </tr>
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">Giao hỏa tốc/lắp đặt đặc biệt</td>
                                                <td className="p-3">Có thể phát sinh phí tùy khu vực và yêu cầu cụ thể.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section id="time">
                                <h2 className="text-xl font-bold">3. Thời gian giao hàng dự kiến</h2>
                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    {[
                                        ["Nội thành", "Trong ngày hoặc 1-2 ngày làm việc"],
                                        ["Tỉnh/thành khác", "2-5 ngày làm việc"],
                                        ["Hàng cần điều chuyển", "Theo thời gian nhân viên xác nhận"],
                                    ].map(([title, description]) => (
                                        <div key={title} className="rounded-lg border p-4">
                                            <p className="font-semibold">{title}</p>
                                            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section id="process">
                                <h2 className="text-xl font-bold">4. Quy trình giao hàng</h2>
                                <ol className="mt-4 space-y-3">
                                    {deliverySteps.map((step, index) => (
                                        <li key={step} className="grid grid-cols-[32px_1fr] gap-3 text-sm leading-7">
                                            <span className="flex size-8 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                                                {index + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <section id="receive">
                                <h2 className="text-xl font-bold">5. Kiểm tra khi nhận hàng</h2>
                                <ul className="mt-4 space-y-3 text-sm leading-7">
                                    {[
                                        "Kiểm tra đúng tên sản phẩm, màu sắc, dung lượng/cấu hình và phụ kiện đi kèm.",
                                        "Kiểm tra tình trạng hộp, tem niêm phong, dấu hiệu móp méo hoặc rách vỡ.",
                                        "Không nhận hàng nếu kiện hàng có dấu hiệu bị mở, thiếu sản phẩm hoặc sai thông tin người nhận.",
                                        "Liên hệ hotline ngay khi phát hiện bất thường để được hỗ trợ lập biên bản xử lý.",
                                    ].map((item) => (
                                        <li key={item} className="flex gap-2">
                                            <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-5 flex gap-2 rounded-lg border bg-blue-50 p-4 text-sm text-blue-900">
                                    <MapPin className="mt-0.5 size-4 shrink-0" />
                                    <p>
                                        Địa chỉ giao hàng cần đầy đủ số nhà, đường, phường/xã, quận/huyện, tỉnh/thành và số điện thoại có thể liên hệ trong giờ giao.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
