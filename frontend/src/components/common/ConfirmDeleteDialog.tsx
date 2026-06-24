import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

type Props = {
    open: boolean;
    title?: string;
    description?: string;
    loading?: boolean;
    confirmText?: string;
    loadingText?: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export default function ConfirmDeleteDialog({
    open,
    title = "Xác nhận xóa",
    description = "Dữ liệu sau khi xóa sẽ không thể khôi phục.",
    loading,
    confirmText = "Xóa",
    loadingText = "Đang xóa...",
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
                        {loading ? loadingText : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
