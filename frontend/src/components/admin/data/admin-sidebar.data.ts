import {
  BadgePercent,
  Boxes,
  ChartColumn,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  Users,
} from "lucide-react";

export const adminSidebarItems = [
  {
    title: "Tổng quan",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Sản phẩm",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Thuộc tính",
    url: "/admin/attributes",
    icon: SlidersHorizontal,
  },
  {
    title: "Danh mục",
    url: "/admin/categories",
    icon: Boxes,
  },
  {
    title: "Thương hiệu",
    url: "/admin/brands",
    icon: Tags,
  },
  {
    title: "Khuyến mãi",
    url: "/admin/promotions",
    icon: BadgePercent,
  },
  {
    title: "Đơn hàng",
    url: "/admin/orders",
    icon: ClipboardList,
  },
  {
    title: "Bảo hành",
    url: "/admin/warranties",
    icon: ShieldCheck,
  },
  {
    title: "Người dùng",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Bài viết",
    url: "/admin/blogs",
    icon: FileText,
  },
  {
    title: "Thống kê",
    url: "/admin/statistics",
    icon: ChartColumn,
  },
  {
    title: "Cài đặt",
    url: "/admin/settings",
    icon: Settings,
  },
];
