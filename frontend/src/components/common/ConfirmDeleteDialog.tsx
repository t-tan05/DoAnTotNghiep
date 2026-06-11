import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

type Props = {
    open: boolean;
    title?: string;
    description?: string;
    loading?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export default function ConfirmDeleteDialog({
    open,
    title = "Xác nhận xóa",
    description = "Dữ liệu sau khi xóa sẽ không thể khôi phục.",
    loading,
    onOpenChange,
    onConfirm,
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        {loading ? "Đang xóa..." : "Xóa"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}