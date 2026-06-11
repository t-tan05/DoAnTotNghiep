import FormError from "@/components/common/FormError";
import OtpInputField from "@/components/common/OtpInputField";
import SpinnerButton from "@/components/common/SpinnerButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type VerifyResetCodeLocationState = {
    email?: string;
};

export default function VerifyResetCodePage() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = useMemo(() => {
        const state = location.state as VerifyResetCodeLocationState | null;

        return state?.email || sessionStorage.getItem("pendingResetEmail") || "";
    }, [location.state]);

    const [resetCode, setResetCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isOtpComplete = resetCode.length === 6;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setError("");

        if(!email) {
            setError("Không tìm thấy email cần xác nhận. Vui lòng gửi lại mã.");
            return;
        }

        if(!isOtpComplete){
            setError("Vui lòng nhập đủ 6 ký tự xác nhận.");
            return;
        }

        setLoading(true);

        try{
            await authService.verifyResetCode({
                email,
                resetCode
            });
            toast.success("Mã xác nhận hợp lệ.");

            sessionStorage.setItem("verifiedResetEmail", email);
            sessionStorage.setItem("verifiedResetCode", resetCode);

            navigate("/reset-password", {
                state: {
                    email,
                    resetCode,
                },
            });
        }catch(error){
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    if(!email){
        return (
            <AuthLayout
                title="Thiếu thông tin xác nhận"
                description="Không tìm thấy email cần đổi mật khẩu. Vui lòng gửi lại mã."
            >
                <Button asChild className="w-full">
                    <Link to="/forgot-password">Quay lại quên mật khẩu</Link>
                </Button>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Xác nhận mã"
            description="Nhập mã xác nhận gồm 6 ký tự đã được gửi tới email của bạn."
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <FormError message={error} />

                <p className="text-center text-sm text-muted-foreground">
                    Mã xác nhận đã được gửi tới{" "}
                    <span className="font-medium text-foreground">{email}</span>
                </p>

                <div className="space-y-3">
                    <label className="block text-center text-sm font-medium">
                        Mã xác nhận
                    </label>

                    <OtpInputField 
                        value={resetCode}
                        onChange={setResetCode}
                        disable={loading}
                    />
                </div>

                <SpinnerButton 
                    type="submit"
                    loading={loading}
                    loadingText="Đang kiểm tra..."
                    disabled={!isOtpComplete}
                    className="w-full"
                >
                    Tiếp tục
                </SpinnerButton>
            </form>
        </AuthLayout>
    );
}