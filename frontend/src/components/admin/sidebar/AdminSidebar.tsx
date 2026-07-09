import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import { adminSidebarItems } from "../data/admin-sidebar.data";

export default function AdminSidebar() {
    const { pathname } = useLocation();

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
                            const isActive = item.url === "/admin"
                                ? pathname === item.url
                                : pathname === item.url || pathname.startsWith(`${item.url}/`);

                            return (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={item.title}
                                        className={isActive ? "bg-sky-50 text-sky-700 font-medium hover:bg-sky-50 [&_svg]:text-sky-600" : ""}
                                    >
                                        <NavLink
                                            to={item.url}
                                            end={item.url === "/admin"}
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
