import { NavLink } from "react-router-dom";
import { navItems } from "./navbar.data";
import { ChevronDown } from "lucide-react";
import ProductMegaMenu from "./ProductMegaMenu";

export default function MainNav() {
    return (
        <nav className="relative border-t border-b bg-white">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-center gap-14 px-6">
                {navItems.map((item) => {
                    if(item.hasMegaMenu){
                        return (
                            <div key={item.label} className="group flex h-full items-center">
                                <NavLink 
                                    to={item.href} 
                                    className={({ isActive }) =>
                                        [
                                        "flex items-center gap-1 text-base font-bold transition hover:text-blue-700",
                                        isActive ? "text-blue-700" : "text-foreground",
                                        ].join(" ")
                                    }
                                >
                                    {item.label}
                                    <ChevronDown className="size-4" />
                                </NavLink>

                                <ProductMegaMenu />
                            </div>
                        );
                    }

                    return (
                        <NavLink 
                            key={item.label}
                            to={item.href}
                            className={({isActive}) => 
                                [
                                "flex h-full items-center text-base font-bold transition hover:text-blue-700",
                                isActive ? "text-blue-700" : "text-foreground",
                                ].join(" ")
                            }
                        >
                            {item.label}
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}