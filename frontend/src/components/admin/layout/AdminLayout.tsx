import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "../sidebar/AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout() {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AdminSidebar />

                <SidebarInset>
                    <AdminHeader />
                    <main className="flex-1 bg-muted/30 p-4 md:p-6">
                        <Outlet />
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}