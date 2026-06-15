import { employeeSidebarItems } from "@/components/employee/data/employee-sidebar.data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function EmployeeMobileSidebar({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <button
                type="button"
                aria-label="Đóng menu"
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <aside className="relative h-full w-80 max-w-[85vw] bg-background shadow-xl">
                <div className="flex h-20 items-center justify-between border-b px-5">
                    <div>
                        <p className="font-semibold">Employee Panel</p>
                        <p className="text-sm text-muted-foreground">Quản lý nội dung</p>
                    </div>

                    <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="space-y-1 px-3 py-5">
                    {employeeSidebarItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.url}
                                to={item.url}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
                                        isActive && "bg-muted text-primary"
                                    )
                                }
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>
        </div>
    );
}