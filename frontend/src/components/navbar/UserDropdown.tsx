import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Heart, LockKeyhole, LogIn, LogOut, MapPinned, Package, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function UserDropdown() {
    const { isAuthenticated, user, logout } = useAuth();

    async function handleLogout() {
        await logout();
    }

    return (
        <div className="group relative">
            <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="flex min-w-14 flex-col items-center justify-center gap-1 text-muted-foreground transition hover:text-blue-700"
                aria-label="Tài khoản"
            >
                <UserRound className="size-6" />
                <span className="text-xs leading-none">Tài khoản</span>
            </Link>

            <div
                className={cn(
                    "invisible absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-lg border bg-white opacity-0 shadow-xl transition-all duration-200",
                    "translate-y-2",
                    "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                )}
            >
                {isAuthenticated ? (
                    <>
                        <div className="border-b px-4 py-3">
                            <p className="text-sm font-semibold text-foreground">
                                {user?.name || "Tài khoản"}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>

                        <Link
                            to="/account"
                            className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-muted"
                        >
                            <UserRound className="size-4" />
                            Xem thông tin cá nhân
                        </Link>

                        <Link
                            to="/account/password"
                            className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-muted"
                        >
                            <LockKeyhole className="size-4" />
                            Đổi mật khẩu
                        </Link>

                        <Link
                            to="/account/orders"
                            className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-muted"
                        >
                            <Package className="size-4" />
                            Quản lý đơn hàng
                        </Link>

                        <Link
                            to="/account/wishlist"
                            className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-muted"
                        >
                            <Heart className="size-4" />
                            Sản phẩm yêu thích
                        </Link>

                        <Link
                            to="/account/addresses"
                            className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-muted"
                        >
                            <MapPinned className="size-4" />
                            Sổ địa chỉ
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                        >
                            <LogOut className="size-4" />
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-muted"
                    >
                        <LogIn className="size-4" />
                        Đăng nhập
                    </Link>
                )}
            </div>
        </div>
    );
}
