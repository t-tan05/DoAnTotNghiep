import {
    Heart,
    LockKeyhole,
    MapPin,
    Package,
    UserRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";


type ProfileSidebarProps = {
    userName?: string;
    email?: string;
};

const menuItems = [
    {
        to: "/account",
        label: "Thông tin tài khoản",
        icon: UserRound,
        end: true,
    },
    {
        to: "/account/password",
        label: "Đổi mật khẩu",
        icon: LockKeyhole,
    },
    {
        to: "/account/orders",
        label: "Quản lý đơn hàng",
        icon: Package,
    },
    {
        to: "/account/wishlist",
        label: "Sản phẩm yêu thích",
        icon: Heart,
    },
    {
        to: "/account/addresses",
        label: "Sổ địa chỉ",
        icon: MapPin,
    },
] as const;

export default function ProfileSidebar({
    userName,
    email,
}: ProfileSidebarProps) {

    return (
    <aside className="min-w-0 overflow-hidden rounded-xl border bg-white p-4 lg:p-5">
      <div className="mb-5 flex items-center gap-3 border-b pb-5">
        <div className="flex size-11 items-center justify-center rounded-full border">
          <UserRound className="size-5 text-muted-foreground md:size-6" />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Tài khoản của</p>
          <p className="truncate font-semibold">{userName || email}</p>
        </div>
      </div>

      <nav className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : undefined}
              className={({ isActive }) =>
                [
                  "flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition lg:w-full lg:shrink",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-foreground hover:bg-muted",
                ].join(" ")
              }
            >
              <Icon className="size-4" />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
