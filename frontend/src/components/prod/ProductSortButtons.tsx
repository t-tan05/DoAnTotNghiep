type Props = {
    totalItems: number;
    sortBy: string;
    onSortChange: (value: string) => void;
};

const sortOptions = [
    { value: "promotion", label: "Khuyến mãi tốt nhất" },
    { value: "price_asc", label: "Giá tăng dần" },
    { value: "price_desc", label: "Giá giảm dần" },
    { value: "newest", label: "Sản phẩm mới nhất" },
    { value: "best_selling", label: "Sản phẩm bán chạy nhất" },
];

export default function ProductSortButtons({
    totalItems,
    sortBy,
    onSortChange,
}: Props) {
    return (
        <div className="rounded-md border bg-white">
            <div className="flex flex-wrap items-center gap-2 p-4">
                <p className="sr-only">
                    Tìm thấy{" "}
                    <span className="font-semibold text-foreground">
                        {totalItems}
                    </span>{" "}
                    sản phẩm
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">Sắp xếp theo</span>
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onSortChange(option.value)}
                            className={`rounded-md border cursor-pointer px-4 py-2 text-sm transition ${
                                sortBy === option.value
                                    ? "border-blue-500 bg-white text-primary ring-1 ring-primary"
                                    : "border-border bg-background hover:border-blue-500 hover:text-primary"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
