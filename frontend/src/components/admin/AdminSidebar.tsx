import { NavLink } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { adminSidebarItems } from "./admin-sidebar.data";

export default function AdminSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex h-12 items-center gap-3 px-2">
                    <img src="/assets/logo.jpg" alt="Logo" className="size-9 rounded-md object-cover" />

                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-semibold">Admin Pannel</p>
                        <p className="text-xs text-muted-foreground">Quản trị hệ thống</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Quản lý</SidebarGroupLabel>

                    <SidebarMenu>
                        {adminSidebarItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <NavLink
                                            to={item.url}
                                            end={item.url === "/admin"}
                                            className={({ isActive }) => isActive ? "bg-sidebar-accent test-sidebar-accent-foreground" : ""}
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