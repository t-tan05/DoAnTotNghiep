import { Outlet } from "react-router-dom";
import Footer from "../footer/Footer";
import HomeNavbar from "../navbar/HomeNavbar";

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />

            <main>
                <Outlet/>
            </main>
            
            <Footer />
        </div>
    )
}