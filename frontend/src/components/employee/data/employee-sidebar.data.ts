import { ClipboardList, FileText, Newspaper } from "lucide-react";

export const employeeSidebarItems = [
    {
        title: "Quản lý blog",
        url: "/employee/blogs",
        icon: FileText,
    },
    {
        title: "Lấy tin công nghệ",
        url: "/employee/external-news",
        icon: Newspaper,
    },
    {
        title: "Đơn hàng",
        url: "/employee/orders",
        icon: ClipboardList
    }
];
