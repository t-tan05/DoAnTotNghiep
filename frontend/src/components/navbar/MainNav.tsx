import { Link, useLocation } from "react-router-dom";
import { navItems, dropdownMenus } from "./navbar.data";
import { ChevronDown } from "lucide-react";
import ProductMegaMenu from "./ProductMegaMenu";

export default function MainNav() {
    const location = useLocation();

    function isHrefActive(href: string) {
        const targetUrl = new URL(href, window.location.origin);

        if (targetUrl.pathname !== location.pathname) {
            return false;
        }

        if (!targetUrl.search) {
            return location.search === "";
        }

        const currentParams = new URLSearchParams(location.search);

        for (const [key, value] of targetUrl.searchParams.entries()) {
            if (currentParams.get(key) !== value) {
                return false;
            }
        }

        return true;
    }

    return (
        <nav className="relative border-t border-b bg-white">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-center gap-14 px-6">
                {navItems.map((item) => {
                    if(item.menuKey){
                        const isActive = isHrefActive(item.href);

                        return (
                            <div key={item.label} className="group/nav relative flex h-full items-center">
                                <Link
                                    to={item.href} 
                                    className={[
                                        "flex items-center gap-1 text-base font-bold transition hover:text-blue-700",
                                        isActive ? "text-blue-700" : "text-foreground",
                                    ].join(" ")}
                                >
                                    {item.label}
                                    <ChevronDown className="size-4" />
                                </Link>

                                <ProductMegaMenu groups={dropdownMenus[item.menuKey]} />
                            </div>
                        );
                    }

                    const isActive = isHrefActive(item.href);

                    return (
                        <Link
                            key={item.label}
                            to={item.href}
                            className={[
                                "flex h-full items-center text-base font-bold transition hover:text-blue-700",
                                isActive ? "text-blue-700" : "text-foreground",
                            ].join(" ")}
                        >
                            {item.label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
