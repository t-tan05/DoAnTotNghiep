type Props = {
    totalItems: number;
    sortBy: string;
    onSortChange: (value: string) => void;
};

export default function ProductSortBar({
    totalItems,
    sortBy,
    onSortChange,
}: Props) {
    return (
        <div className="flex flex-col gap-3 rounded-md border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Tìm thấy{" "}
                <span className="font-semibold text-foreground">
                    {totalItems}
                </span>{" "}
                sản phẩm
            </p>

            <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
            >
                <option value="newest">Sản phẩm mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name_asc">Tên A-Z</option>
            </select>
        </div>
    );
}