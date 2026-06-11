import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import type { SortOrder } from "@/types/admin-table.type";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import AdminTablePagination from "./AdminTablePagination";

export type AdminColumn<T> = {
    key: keyof T | string;
    title: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
};

type Props<T> = {
    title: string;
    description?: string;
    items: T[];
    columns: AdminColumn<T>[];
    idKey: keyof T;
    search: string;
    page: number;
    totalPages: number;
    sortBy: string;
    sortOrder: SortOrder;
    loading?: boolean;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onSortChange: (sortBy: string) => void;
    onAdd: () => void;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
};

export default function AdminDataTable<T>({
    title,
    description,
    items,
    columns,
    idKey,
    search,
    page,
    totalPages,
    sortBy,
    sortOrder,
    loading,
    onSearchChange,
    onPageChange,
    onSortChange,
    onAdd,
    onEdit,
    onDelete,
}: Props<T>) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {description ? (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>

                <Button onClick={onAdd} className="h-12 w-full sm:w-auto cursor-pointer">
                    <Plus className="mr-2 h-4 w-4"/>
                    Thêm mới 
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Tìm kiếm..."
                    className="pl-9"
                />
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={String(column.key)}>
                                    {column.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => onSortChange(String(column.key))}
                                            className="inline-flex items-center gap-1 font-medium cursor-pointer"
                                        >
                                            {column.title}
                                            {sortBy === column.key && sortOrder === "asc" ? (
                                                <ArrowUp className="h-3.5 w-3.5"/>
                                            ) : null}
                                            {sortBy === column.key && sortOrder === "desc" ? (
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            ) : null}
                                        </button>
                                    ) : (
                                        column.title
                                    )}
                                </TableHead>
                            ))}

                            <TableHead className="w-[120px] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : null }

                        {!loading && items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {!loading && items.map((item) => (
                            <TableRow key={String(item[idKey])}>
                                {columns.map((column) => (
                                    <TableCell key={String(column.key)}>
                                        {column.render ? column.render(item) : String(item[column.key as keyof T] ?? "")}
                                    </TableCell>
                                ))}

                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant={"outline"}
                                            size={"icon"}
                                            onClick={() => onEdit(item)}
                                            className="cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button 
                                            variant={"destructive"}
                                            size={"icon"}
                                            onClick={() => onDelete(item)}
                                            className="cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AdminTablePagination 
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </section>
    )
}