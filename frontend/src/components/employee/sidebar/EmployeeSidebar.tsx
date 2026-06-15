import { NavLink } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { employeeSidebarItems } from "../data/employee-sidebar.data";

export default function EmployeeSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex h-12 items-center gap-3 px-2">
                    <img src="/assets/logo.jpg" alt="Logo" className="size-9 rounded-md object-cover" />

                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-semibold">Employee Panel</p>
                        <p className="text-xs text-muted-foreground">Quản lý nội dung</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Quản lý</SidebarGroupLabel>

                    <SidebarMenu>
                        {employeeSidebarItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <NavLink
                                            to={item.url}
                                            end={item.url === "/employee"}
                                            className={({ isActive }) =>
                                                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                                            }
                                        >
                                            <Icon />
                                            <span>{item.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
