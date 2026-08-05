import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa6";

type FooterSocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
};

type FooterProps = {
  socialLinks?: FooterSocialLinks;
};

export default function Footer({ socialLinks }: FooterProps) {
  const socials = [
    {
      label: "Facebook",
      href: socialLinks?.facebook ?? "#",
      icon: FaFacebook,
    },
    {
      label: "Instagram",
      href: socialLinks?.instagram ?? "#",
      icon: FaInstagram,
    },
    {
      label: "TikTok",
      href: socialLinks?.tiktok ?? "#",
      icon: FaTiktok,
    },
  ];

  return (
    <footer className="border-t bg-[#1D5D9B] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-5">
        <div>
          <img
            src="/assets/logo.jpg"
            alt="Logo"
            className="h-20 w-auto object-contain"
          />

          <p className="mt-3 text-sm text-justify">
            Cửa hàng công nghệ uy tín, sản phẩm chính hãng, chuyên cung cấp các sản phẩm công nghệ chính hãng với giá tốt nhất thị trường.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Danh mục</h3>

          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/c/laptop">Laptop</Link></li>
            <li><Link to="/c/dien-thoai">Điện thoại</Link></li>
            <li><Link to="/c/thiet-bi-am-thanh">Thiết bị âm thanh</Link></li>
            <li><Link to="/c/phu-kien">Phụ kiện máy tính</Link></li>
            <li><Link to="/tin-tuc">Tin tức</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Hỗ trợ</h3>

          <ul className="mt-3 space-y-2 text-sm">
            <li>Hotline: 0909493175</li>
            <li>Email: thanhtan@gmail.com</li>
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

          <ul className="mt-3 flex items-center gap-4 text-sm">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <Icon size={24} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-center text-sm">
        © 2026. All rights reserved.
      </div>
    </footer>
  );
}
