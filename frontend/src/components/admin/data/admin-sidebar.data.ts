import {
  Boxes,
  ChartColumn,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
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
    title: "Đơn hàng",
    url: "/admin/orders",
    icon: ClipboardList,
  },
  {
    title: "Người dùng",
    url: "/admin/users",
    icon: Users,
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