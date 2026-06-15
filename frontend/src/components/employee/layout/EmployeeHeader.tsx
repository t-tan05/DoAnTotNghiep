import AdminAvatarMenu from "@/components/admin/layout/AdminAvatarMenu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function EmployeeHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="flex items-center gap-3">
                <SidebarTrigger />

                <Separator orientation="vertical" className="h-5" />

                <div>
                    <h1 className="text-base font-semibold">Trang nhân viên</h1>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                        Quản lý bài viết và nội dung
                    </p>
                </div>
            </div>

            <AdminAvatarMenu />
        </header>
    );
}
