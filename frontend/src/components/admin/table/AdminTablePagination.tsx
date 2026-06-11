import { Button } from "@/components/ui/button";

type Props = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function AdminTablePagination({
    page,
    totalPages,
    onPageChange,
}: Props) {
    return (
        <div className="flex items-center justify-end gap-2 pt-4">
            <Button
                variant={"outline"}
                size={"sm"}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                Trước
            </Button>

            <span className="text-sm text-muted-foreground">
                Trang {page} / {Math.max(totalPages, 1)}
            </span>

            <Button
                variant={"outline"}
                size={"sm"}
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Sau
            </Button>
        </div>
    )
}