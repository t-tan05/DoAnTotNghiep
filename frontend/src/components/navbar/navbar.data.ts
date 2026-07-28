export type DropdownMenuKey = "laptop" | "phone" | "thietbiamthanh" | "phukienmaytinh";

export type DropdownMenuGroup = {
    title: string;
    href?: string;
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
        label: "THIẾT BỊ ÂM THANH",
        href: "/c/thiet-bi-am-thanh",
        menuKey: "thietbiamthanh",
    },
    {
        label: "PHỤ KIỆN MÁY TÍNH",
        href: "/c/phu-kien-pc",
        menuKey: "phukienmaytinh",
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
                { label: "HP", href: "/c/laptop-hp" },
                { label: "Lenovo", href: "/c/laptop-lenovo" },
                { label: "MSI", href: "/c/laptop-msi" },
                { label: "ASUS", href: "/c/laptop-asus" },
                { label: "Acer", href: "/c/laptop-acer" },
            ],
        },
        {
            title: "Nhu cầu",
            items: [
                { label: "Laptop Gaming", href: "/c/laptop-gaming" },
                { label: "Laptop AI", href: "/c/laptop-ai" },
                { label: "Laptop Đồ họa", href: "/c/laptop-do-hoa" },
            ],
        },
    ],
    phone: [
        {
            title: "Thương hiệu",
            items: [
                { label: "iPhone", href: "/c/iphone" },
                { label: "Samsung", href: "/c/dien-thoai-samsung" },
                { label: "Honor", href: "/c/dien-thoai-honor" },
            ],
        },
    ],
    thietbiamthanh: [
        {
            title: "Tai nghe",
            href: "/c/tai-nghe",
            items: [
                { label: "Asus", href: "/c/tai-nghe-asus" },
                { label: "Apple", href: "/c/tai-nghe-apple" },
                { label: "Sony", href: "/c/tai-nghe-sony" },
                { label: "Logitech", href: "/c/tai-nghe-logitech" },
            ],
        },
        {
            title: "Loa nghe nhạc",
            href: "/c/loa-nghe-nhac",
            items: [
                { label: "Sony", href: "/c/loa-nghe-nhac-sony" },
                { label: "Tronsmart", href: "/c/loa-nghe-nhac-tronsmart" },
            ],
        },
    ],
    phukienmaytinh: [
        {
            title: "Chuột máy tính",
            href: "/c/chuot-may-tinh",
            items: [
                { label: "Asus", href: "/c/chuot-asus" },
                { label: "Logitech", href: "/c/chuot-logitech" },
                { label: "MSI", href: "/c/chuot-msi" },
                { label: "Xiaomi", href: "/c/chuot-xiaomi" },
            ]
        },
        {
            title: "Bàn phím",
            href: "/c/ban-phim",
            items: [
                { label: "Asus", href: "/c/ban-phim-asus" },
                { label: "Logitech", href: "/c/ban-phim-logitech" },
                { label: "Aula", href: "/c/ban-phim-aula" },
                { label: "Dell", href: "/c/ban-phim-dell" },
                { label: "MSI", href: "/c/ban-phim-msi" },
            ]
        }
    ]
};
