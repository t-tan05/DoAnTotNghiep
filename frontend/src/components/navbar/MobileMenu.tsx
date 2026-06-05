import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { navItems, productCategories } from "./navbar.data";
import { Link } from "react-router-dom";

type ProductCategory = {
    title: string;
    items: string[];
}

type MobileMenuProps = {
    open: boolean;
    activePanel: "main" | "products" | "category";
    selectedCategory: ProductCategory | null;
    onClose: () => void;
    onOpenProducts: () => void;
    onOpenCategory: (category: ProductCategory) => void;
    onBackMain: () => void;
    onBackProducts: () => void;
};

export default function MobileMenu({
    open,
    activePanel,
    selectedCategory,
    onClose,
    onOpenProducts,
    onOpenCategory,
    onBackMain,
    onBackProducts,
} : MobileMenuProps) {

    return (
        <div 
            className={[
                "fixed inset-0 z-[100] lg:hidden",
                "transition-colors duration-300 ease-out",
                open
                ? "visible bg-black/20"
                : "invisible bg-black/0 pointer-events-none",
            ].join(" ")}
            onClick={onClose}
        >
            <aside 
                onClick={(e) => e.stopPropagation()}
                className={[
                    "h-full w-[86vw] max-w-[610px] bg-white shadow-xl",
                    "transition-transform duration-300 ease-out",
                    open ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                <div className="flex h-20 items-center justify-end border-b px-7">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-10 items-center justify-center hover:cursor-pointer"
                        aria-label="Đóng menu"
                    >
                        <X className="size-6"/>
                    </button>
                </div>

                {activePanel === "main" && (
                    <nav className="animate-in fade-in slide-in-from-left-3 duration-200 px-7 py-5">
                        {navItems.map((item) => {
                            if(item.hasMegaMenu){
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={onOpenProducts}
                                        className="flex h-14 w-full items-center justify-between border-b text-left text-base font-medium uppercase"
                                    >
                                        {item.label}
                                        <ChevronRight className="size-5" />
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    onClick={onClose}
                                    className="flex h-14 items-center border-b text-base font-medium uppercase"
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                )}

                {activePanel === "products" && (
                    <nav className="animate-in fade-in slide-in-from-right-3 duration-200 px-7 py-5">
                        <button
                            type="button"
                            onClick={onBackMain}
                            className="flex h-14 w-full items-center gap-2 border-b text-left text-base font-medium uppercase"
                        >
                            <ChevronLeft className="size-5" />
                            Sản phẩm
                        </button>

                        {productCategories.map((group) => (
                            <button
                                key={group.title}
                                type="button"
                                onClick={() => onOpenCategory(group)}
                                className="flex h-14 w-full items-center justify-between border-b text-left text-base font-medium uppercase"
                            >
                                {group.title}
                                {group.items.length > 0 && <ChevronRight className="size-5" />}
                            </button>
                        ))}
                    </nav>
                )}

                {activePanel === "category" && selectedCategory && (
                    <nav className="animate-in fade-in slide-in-from-right-3 duration-200 px-7 py-5">
                        <button
                            type="button"
                            onClick={onBackProducts}
                            className="flex h-14 w-full items-center gap-2 border-b text-left text-base font-medium uppercase"
                        >
                            <ChevronLeft className="size-5" />
                            {selectedCategory.title}
                        </button>

                        {selectedCategory.items.map((item) => (
                            <Link
                                key={item}
                                to={`/products?category=${encodeURIComponent(selectedCategory.title)}&type=${encodeURIComponent(item)}`}
                                onClick={onClose}
                                className="flex h-14 items-center border-b text-base text-muted-foreground"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>
                )}
            </aside>
        </div>
    )
}