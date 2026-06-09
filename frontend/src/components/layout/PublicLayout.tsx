import { Outlet } from "react-router-dom";
import Footer from "../footer/Footer";
import HomeNavbar from "../navbar/HomeNavbar";

export default function PublicLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <HomeNavbar />

            <main className="flex-1">
                <Outlet/>
            </main>
            
            <Footer />
        </div>
    )
}