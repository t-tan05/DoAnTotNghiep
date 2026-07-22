export type DropdownMenuKey = "laptop" | "phone";

export type DropdownMenuGroup = {
    title: string;
    items: Array<{
        label: string;
        href: string;
    }>;
};

type NavItem = {
    label: string;
    href: string;
    menuKey?: DropdownMenuKey;
};

export const navItems: NavItem[] = [
    {
        label: "TRANG CHỦ",
        href: "/",
    },
    {
        label: "LAPTOP",
        href: "/c/laptop",
        menuKey: "laptop",
    },
    {
        label: "ĐIỆN THOẠI",
        href: "/c/dien-thoai",
        menuKey: "phone",
    },
    {
        label: "PHỤ KIỆN",
        href: "/c/phu-kien",
    },
    {
        label: "TIN TỨC",
        href: "/tin-tuc",
    },
];

export const dropdownMenus: Record<DropdownMenuKey, DropdownMenuGroup[]> = {
    laptop: [
        {
            title: "Thương hiệu",
            items: [
                { label: "Laptop HP", href: "/c/laptop-hp" },
                { label: "Laptop Lenovo", href: "/c/laptop-lenovo" },
                { label: "Laptop MSI", href: "/c/laptop-msi" },
                { label: "Laptop ASUS", href: "/c/laptop-asus" },
                { label: "Laptop Acer", href: "/c/laptop-acer" },
            ],
        },
        {
            title: "Nhu cầu",
            items: [
                { label: "Laptop gaming", href: "/c/laptop-gaming" },
                { label: "Laptop AI", href: "/c/laptop-ai" },
                { label: "Laptop cơ bản", href: "/c/laptop-hp-co-ban" },
            ],
        },
    ],
    phone: [
        {
            title: "Thương hiệu",
            items: [
                { label: "iPhone", href: "/c/iphone" },
                { label: "Samsung", href: "/c/dien-thoai-samsung" },
            ],
        },
    ],
};
