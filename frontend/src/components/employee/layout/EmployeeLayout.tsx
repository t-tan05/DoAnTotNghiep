import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import EmployeeHeader from "./EmployeeHeader";
import EmployeeSidebar from "../sidebar/EmployeeSidebar";

export default function EmployeeLayout() {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <EmployeeSidebar />

                <SidebarInset>
                    <EmployeeHeader />
                    <main className="flex-1 bg-muted/30 p-4 md:p-6">
                        <Outlet />
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
