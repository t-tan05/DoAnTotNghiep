import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import HeaderActions from "./HeaderActions";
import MainNav from "./MainNav";

export default function HomeNavbar() {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="mx-auto flex h-24 max-w-7xl items-center gap-8 px-6">
                <Link to="/" className="shrink-0">
                    <img 
                        src="/assets/logo.jpg" 
                        alt="Logo" 
                        className="h-36 w-auto object-contain" 
                    />
                </Link>

                <SearchBar />

                <HeaderActions />
            </div>

            <MainNav />
        </header>
    )
}