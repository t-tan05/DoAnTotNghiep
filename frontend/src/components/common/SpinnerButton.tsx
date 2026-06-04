import { Button, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ComponentProps } from "react";

//Lấy type từ thư viện CVA
import type { VariantProps } from "class-variance-authority";

type SpinnerButtonProps = ComponentProps<"button"> &
  //Lấy type từ shadcn Button (variant, size)
  VariantProps<typeof buttonVariants> & {
    
    //Thêm 2 props riêng
    loading?: boolean;
    loadingText?: string;
};

export default function SpinnerButton({
  loading = false,
  loadingText = "Đang xử lý...",
  disabled,
  children,
  ...props
}: SpinnerButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading && <Spinner data-icon="inline-start" />}
      {loading ? loadingText : children}
    </Button>
  )
}
