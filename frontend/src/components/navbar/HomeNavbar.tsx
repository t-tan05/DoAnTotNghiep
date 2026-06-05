import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import HeaderActions from "./HeaderActions";
import MainNav from "./MainNav";
import { useState } from "react";
import { Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";

type MobilePanel = "main" | "products" | "category";

type ProductCategory = {
    title: string;
    items: string[];
};

export default function HomeNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activePanel, setActivePanel] = useState<MobilePanel>("main");
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

    function openMobileMenu(){
        setActivePanel("main");
        setSelectedCategory(null);
        setMobileMenuOpen(true);
    }

    function closeMobileMenu() {
        setMobileMenuOpen(false);
        setActivePanel("main");
        setSelectedCategory(null);
    }

    function openProductsPanel(){
        setActivePanel("products");
        setSelectedCategory(null);
    }

    function openCategoryPanel(category: ProductCategory) {
        setSelectedCategory(category);
        setActivePanel("category");
    }

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:h-24 md:px-6">
                <Link to="/" className="shrink-0">
                    <img 
                        src="/assets/logo.jpg" 
                        alt="Logo" 
                        className="h-16 w-auto object-contain md:h-24 lg:h-28" 
                    />
                </Link>

                <div className="hidden flex-1 lg:block">
                    <SearchBar />
                </div>

                <HeaderActions />
            </div>

            <div className="mx-auto flex max-w-7xl items-center gap-3 border-t px-4 py-3 lg:hidden">
                <button 
                    type="button"
                    onClick={openMobileMenu}
                    className="flex size-12 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white hover:cursor-pointer"
                    aria-label="Mở menu"
                >
                    <Menu className="size-6" />
                </button>

                <SearchBar />
            </div>

            <div className="hidden lg:block">
                <MainNav />
            </div>

            <MobileMenu 
                open={mobileMenuOpen}
                activePanel={activePanel}
                selectedCategory={selectedCategory}
                onClose={closeMobileMenu}
                onOpenProducts={openProductsPanel}
                onOpenCategory={openCategoryPanel}
                onBackMain={() => {
                    setActivePanel("main")
                    setSelectedCategory(null);
                }}
                onBackProducts={() => {
                    setActivePanel("products");
                    setSelectedCategory(null);
                }}
            />
        </header>
    )
}