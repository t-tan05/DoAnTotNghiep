import { AlertTriangle, CheckCircle2, RefreshCcw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const exchangeCases = [
    "Sản phẩm giao sai mẫu, sai cấu hình, thiếu phụ kiện hoặc không đúng thông tin trên đơn hàng.",
    "Sản phẩm lỗi phần cứng do nhà sản xuất trong thời gian đổi trả được công bố.",
    "Sản phẩm còn đầy đủ hộp, phụ kiện, quà tặng, hóa đơn và không bị trầy xước nặng do người dùng.",
    "Serial/IMEI trên sản phẩm trùng với thông tin đã bán ra từ hệ thống.",
];

export default function ReturnPolicyPage() {
    return (
        <section className="bg-muted/40 py-8 md:py-10">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <div className="mb-5 text-sm text-muted-foreground">
                    <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
                    <span className="px-2">/</span>
                    <span>Chính sách đổi trả</span>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm md:p-8">
                    <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                        <RefreshCcw className="size-4" />
                        Hỗ trợ đổi trả minh bạch
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Chính sách đổi trả</h1>
                    <p className="mt-3 max-w-3xl text-muted-foreground">
                        Chính sách đổi trả giúp khách hàng yên tâm khi mua sắm, đồng thời đảm bảo sản phẩm được kiểm tra đúng tình trạng trước khi tiếp nhận.
                    </p>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
                        <aside className="h-fit rounded-lg border bg-muted/30 p-4 text-sm lg:sticky lg:top-24">
                            <p className="font-semibold">Nội dung chính</p>
                            <div className="mt-3 space-y-2 text-muted-foreground">
                                <a href="#period" className="block hover:text-blue-700">1. Thời hạn đổi trả</a>
                                <a href="#accepted" className="block hover:text-blue-700">2. Điều kiện áp dụng</a>
                                <a href="#not-accepted" className="block hover:text-blue-700">3. Trường hợp từ chối</a>
                                <a href="#process" className="block hover:text-blue-700">4. Quy trình đổi trả</a>
                                <a href="#refund" className="block hover:text-blue-700">5. Hoàn tiền</a>
                            </div>
                        </aside>

                        <div className="space-y-8">
                            <section id="period">
                                <h2 className="text-xl font-bold">1. Thời hạn đổi trả</h2>
                                <div className="mt-4 overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">0-7 ngày</td>
                                                <td className="p-3">Hỗ trợ đổi mới nếu sản phẩm lỗi do nhà sản xuất và đủ điều kiện ngoại quan.</td>
                                            </tr>
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">8-30 ngày</td>
                                                <td className="p-3">Hỗ trợ đổi sản phẩm tương đương hoặc chuyển bảo hành tùy nhóm hàng và tình trạng kiểm tra.</td>
                                            </tr>
                                            <tr>
                                                <td className="bg-muted/50 p-3 font-medium">Sau 30 ngày</td>
                                                <td className="p-3">Áp dụng chính sách bảo hành theo hãng/cửa hàng.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section id="accepted">
                                <h2 className="text-xl font-bold">2. Điều kiện áp dụng đổi trả</h2>
                                <ul className="mt-4 space-y-3 text-sm leading-7">
                                    {exchangeCases.map((item) => (
                                        <li key={item} className="flex gap-2">
                                            <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section id="not-accepted">
                                <h2 className="text-xl font-bold">3. Trường hợp không hỗ trợ đổi trả</h2>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {[
                                        "Sản phẩm bị rơi vỡ, móp méo, vào nước, cháy nổ hoặc biến dạng trong quá trình sử dụng.",
                                        "Thiếu hộp, phụ kiện, tem niêm phong, quà tặng hoặc hóa đơn đi kèm.",
                                        "Serial/IMEI không trùng với dữ liệu bán hàng của hệ thống.",
                                        "Khách hàng muốn đổi vì không còn nhu cầu sử dụng sau khi sản phẩm không có lỗi.",
                                    ].map((item) => (
                                        <div key={item} className="flex gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">
                                            <XCircle className="mt-0.5 size-4 shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section id="process">
                                <h2 className="text-xl font-bold">4. Quy trình đổi trả</h2>
                                <ol className="mt-4 space-y-3">
                                    {[
                                        "Khách liên hệ hotline hoặc mang sản phẩm đến cửa hàng gần nhất.",
                                        "Nhân viên kiểm tra hóa đơn, serial/IMEI, phụ kiện và tình trạng ngoại quan.",
                                        "Kỹ thuật viên xác nhận lỗi và điều kiện đổi trả.",
                                        "Nếu đủ điều kiện, cửa hàng đổi sản phẩm cùng mẫu hoặc sản phẩm tương đương theo tồn kho.",
                                        "Nếu không còn hàng, khách có thể chọn sản phẩm khác và thanh toán/nhận lại phần chênh lệch nếu có.",
                                    ].map((item, index) => (
                                        <li key={item} className="grid grid-cols-[32px_1fr] gap-3 text-sm leading-7">
                                            <span className="flex size-8 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                                                {index + 1}
                                            </span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <section id="refund">
                                <h2 className="text-xl font-bold">5. Quy định hoàn tiền</h2>
                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                                    <div className="flex gap-2 font-semibold">
                                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                        Thời gian hoàn tiền phụ thuộc phương thức thanh toán
                                    </div>
                                    <p className="mt-2">
                                        Với đơn thanh toán COD, cửa hàng hoàn tiền trực tiếp hoặc chuyển khoản theo thông tin khách cung cấp. Với thanh toán VNPay, hệ thống tạo yêu cầu hoàn tiền và thời gian xử lý phụ thuộc cổng thanh toán/ngân hàng phát hành.
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
