import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AdminAvatarMenu from "./AdminAvatarMenu";

export default function AdminHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="cursor-pointer"/>

                <Separator orientation="vertical" className="h-10" />

                <div>
                    <h1 className="text-base font-semibold">Trang quản trị</h1>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                        Quản lý cửa hàng và dự liệu hệ thống
                    </p>
                </div>
            </div>

            <AdminAvatarMenu />
        </header>
    );
}