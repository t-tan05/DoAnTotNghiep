import { Outlet, useLocation } from "react-router-dom";
import Footer from "../footer/Footer";
import HomeNavbar from "../navbar/HomeNavbar";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { dashboardService } from "@/services/dashboard.service";

export default function PublicLayout() {
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const path = `${location.pathname}${location.search}`;

        dashboardService.trackPageView(path).catch(() => undefined);

        function emitVisitorActive() {
            socket.emit("visitor:active");
        }

        socket.auth = token ? { token } : {};
        socket.on("connect", emitVisitorActive);

        if(!socket.connected) {
            socket.connect();
        }else {
            emitVisitorActive();
        }

        return () => {
            socket.off("connect", emitVisitorActive);
        };
    }, [location.pathname, location.search]);

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
