export default function AdminDashboardPage() {
  return (
    <section>
      <h2 className="text-2xl font-bold">Tổng quan</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Doanh thu</p>
          <p className="mt-2 text-2xl font-bold">0đ</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Đơn hàng</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Sản phẩm</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Người dùng</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
      </div>
    </section>
  );
}