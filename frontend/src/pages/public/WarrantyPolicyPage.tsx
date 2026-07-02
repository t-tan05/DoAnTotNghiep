import { AlertTriangle, CheckCircle2, ClipboardCheck, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const warrantySteps = [
    "Khách hàng kiểm tra serial/IMEI trong mục Bảo hành của tôi hoặc liên hệ hotline để được hỗ trợ tra cứu.",
    "Nhân viên tiếp nhận yêu cầu, kiểm tra thời hạn bảo hành, tình trạng ngoại quan và mô tả lỗi.",
    "Nếu sản phẩm đủ điều kiện, cửa hàng sẽ hẹn khách mang máy tới cửa hàng hoặc sắp xếp lấy máy theo địa chỉ đã đăng ký.",
    "Kỹ thuật viên kiểm tra chi tiết, cập nhật kết quả xử lý lên phiếu bảo hành để khách theo dõi online.",
    "Sau khi hoàn tất, cửa hàng thông báo khách nhận lại sản phẩm tại cửa hàng hoặc giao trả theo thỏa thuận.",
];

export default function WarrantyPolicyPage() {
    return (
        <section className="bg-muted/40 py-8 md:py-10">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <div className="mb-5 text-sm text-muted-foreground">
                    <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
                    <span className="px-2">/</span>
                    <span>Chính sách bảo hành</span>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm md:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                                <ShieldCheck className="size-4" />
                                Hỗ trợ sau bán hàng
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight">Chính sách bảo hành</h1>
                            <p className="mt-3 max-w-3xl text-muted-foreground">
                                Chính sách áp dụng cho sản phẩm được mua tại hệ thống, có hóa đơn/đơn hàng hợp lệ và serial/IMEI được ghi nhận trong dữ liệu bán hàng.
                            </p>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                            <p className="font-semibold">Tra cứu nhanh</p>
                            <p className="mt-1">Vào Tài khoản → Bảo hành để tạo và theo dõi phiếu bảo hành.</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <ShieldCheck className="size-6 text-blue-700" />
                            <h2 className="mt-3 font-semibold">Bảo hành chính hãng</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Sản phẩm được xử lý theo chính sách hãng hoặc trung tâm bảo hành ủy quyền.
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <ClipboardCheck className="size-6 text-blue-700" />
                            <h2 className="mt-3 font-semibold">Có phiếu theo dõi</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Mỗi yêu cầu có mã phiếu riêng, ghi nhận đầy đủ từng bước xử lý.
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <Wrench className="size-6 text-blue-700" />
                            <h2 className="mt-3 font-semibold">Kiểm tra minh bạch</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Tình trạng máy, lỗi phát sinh và kết quả sửa chữa được cập nhật rõ ràng.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
                        <aside className="h-fit rounded-lg border bg-muted/30 p-4 text-sm lg:sticky lg:top-24">
                            <p className="font-semibold">Nội dung chính</p>
                            <div className="mt-3 space-y-2 text-muted-foreground">
                                <a href="#scope" className="block hover:text-blue-700">1. Phạm vi bảo hành</a>
                                <a href="#conditions" className="block hover:text-blue-700">2. Điều kiện bảo hành</a>
                                <a href="#reject" className="block hover:text-blue-700">3. Từ chối bảo hành</a>
                                <a href="#process" className="block hover:text-blue-700">4. Quy trình xử lý</a>
                                <a href="#time" className="block hover:text-blue-700">5. Thời gian xử lý</a>
                            </div>
                        </aside>

                        <div className="space-y-8">
                            <section id="scope">
                                <h2 className="text-xl font-bold">1. Phạm vi bảo hành</h2>
                                <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                                    <p>
                                        Sản phẩm laptop, điện thoại, linh kiện, phụ kiện và thiết bị công nghệ được bảo hành theo thời hạn công bố trên trang sản phẩm hoặc hóa đơn bán hàng.
                                    </p>
                                    <p>
                                        Thời hạn bảo hành được tính từ ngày đơn hàng hoàn tất hoặc ngày sản phẩm được ghi nhận bán ra trong hệ thống.
                                    </p>
                                    <p>
                                        Với sản phẩm có serial/IMEI, hệ thống sẽ ưu tiên kiểm tra bằng serial/IMEI để xác định sản phẩm có thuộc cửa hàng bán ra hay không.
                                    </p>
                                </div>
                            </section>

                            <section id="conditions">
                                <h2 className="text-xl font-bold">2. Điều kiện được bảo hành miễn phí</h2>
                                <ul className="mt-4 space-y-3 text-sm leading-7">
                                    {[
                                        "Sản phẩm còn trong thời hạn bảo hành và có thông tin đơn hàng hợp lệ.",
                                        "Lỗi phát sinh do nhà sản xuất hoặc linh kiện phần cứng trong điều kiện sử dụng bình thường.",
                                        "Serial/IMEI, tem bảo hành hoặc dấu hiệu nhận diện sản phẩm còn nguyên vẹn, không bị cạo sửa.",
                                        "Sản phẩm chưa từng bị can thiệp sửa chữa bởi bên thứ ba không được ủy quyền.",
                                    ].map((item) => (
                                        <li key={item} className="flex gap-2">
                                            <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section id="reject">
                                <h2 className="text-xl font-bold">3. Các trường hợp không áp dụng bảo hành miễn phí</h2>
                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                                    <div className="flex gap-2 font-semibold">
                                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                        Lưu ý quan trọng
                                    </div>
                                    <p className="mt-2">
                                        Cửa hàng có quyền từ chối bảo hành miễn phí hoặc chuyển sang sửa chữa tính phí nếu sản phẩm có dấu hiệu rơi vỡ, vào nước, cháy nổ, biến dạng, tự ý tháo sửa, dùng sai nguồn điện, dùng sai hướng dẫn hoặc lỗi do phần mềm không bản quyền.
                                    </p>
                                </div>
                            </section>

                            <section id="process">
                                <h2 className="text-xl font-bold">4. Quy trình bảo hành</h2>
                                <ol className="mt-4 space-y-3">
                                    {warrantySteps.map((step, index) => (
                                        <li key={step} className="grid grid-cols-[32px_1fr] gap-3 text-sm leading-7">
                                            <span className="flex size-8 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                                                {index + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <section id="time">
                                <h2 className="text-xl font-bold">5. Thời gian xử lý dự kiến</h2>
                                <div className="mt-4 overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">Lỗi phần mềm/cấu hình đơn giản</td>
                                                <td className="p-3">Trong ngày hoặc 1-2 ngày làm việc</td>
                                            </tr>
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">Sửa chữa tại cửa hàng</td>
                                                <td className="p-3">3-7 ngày làm việc tùy linh kiện</td>
                                            </tr>
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">Gửi hãng/trung tâm ủy quyền</td>
                                                <td className="p-3">7-15 ngày làm việc hoặc theo lịch hẹn của hãng</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
