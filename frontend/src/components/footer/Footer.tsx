import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-[#1D5D9B] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-5">
        <div>
          <img
            src="/assets/logo.jpg"
            alt="Logo"
            className="h-20 w-auto object-contain"
          />

          <p className="mt-3 text-sm ">
            Cửa hàng công nghệ uy tín, sản phẩm chính hãng.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Danh mục</h3>

          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/c/laptop">Sản phẩm</Link></li>
            <li><Link to="/tin-tuc">Tin tức</Link></li>
            <li><Link to="/gioi-thieu">Giới thiệu</Link></li>
            <li><Link to="/lien-he">Liên hệ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Hỗ trợ</h3>

          <ul className="mt-3 space-y-2 text-sm">
            <li>Hotline: 0909493175</li>
            <li>Email: support@example.com</li>
            <li>Thời gian: 8:00 - 21:00</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Chính sách</h3>

          <ul className="mt-3 space-y-2 text-sm ">
            <li><Link to="/chinh-sach/bao-hanh">Chính sách bảo hành</Link></li>
            <li><Link to="/chinh-sach/doi-tra">Chính sách đổi trả</Link></li>
            <li><Link to="/chinh-sach/giao-hang">Chính sách giao hàng</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Mạng xã hội</h3>
        </div>
      </div>

      <div className="border-t py-4 text-center text-sm">
        © 2026. All rights reserved.
      </div>
    </footer>
  );
}
