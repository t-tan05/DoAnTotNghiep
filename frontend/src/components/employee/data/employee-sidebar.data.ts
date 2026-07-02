import { ClipboardList, FileText, LayoutTemplate, Newspaper, ShieldCheck } from "lucide-react";

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
        icon: ClipboardList,
    },
    {
        title: "Bảo hành",
        url: "/employee/warranties",
        icon: ShieldCheck,
    },
    {
        title: "CMS",
        url: "/employee/cms",
        icon: LayoutTemplate,
    },
];
