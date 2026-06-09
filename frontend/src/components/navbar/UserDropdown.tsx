import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function UserDropdown() {
    const {isAuthenticated, user, logout} = useAuth();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if(dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);

    async function handleLogout() {
        setOpen(false);
        await logout();
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button 
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex size-10 items-center justify-center rounded-full bg-blue-700 text-white transition hover:bg-blue-800 md:size-12"
                aria-label="Tài khoản"
            >
                <UserRound className="size-5 md:size-6" />
            </button>

            <div 
                className={[
                    "absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-lg border bg-white shadow-lg",
                    "origin-top-right transition-all duration-200 ease-out",
                    open
                        ? "visible translate-y-0 scale-100 opacity-100"
                        : "invisible -translate-y-2 scale-95 opacity-0 pointer-events-none",
                ].join(" ")}
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
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-muted"
                        >
                            <UserRound className="size-4" />
                            Xem thông tin cá nhận
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                        >
                            <LogOut className="size-4" />
                            Đăng xuất
                        </button>
                    </>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-muted"
                        >
                            <LogIn className="size-4" />
                            Đăng nhập
                        </Link>
                    )}
            </div>
        </div>
    )
}