import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ResetPasswordLocationState = {
    email?: string;
    resetCode?: string;
};

export default function ResetPasswordPage(){
    const navigate = useNavigate();
    const location = useLocation();

    const {email, resetCode} = useMemo(() => {
        const state = location.state as ResetPasswordLocationState | null;

        return {
            email: state?.email || sessionStorage.getItem("verifiedResetEmail") || "",
            resetCode: state?.resetCode || sessionStorage.getItem("verifiedResetCode") || "",
        };
    }, [location.state]);

    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateField(name: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
            await authService.resetPassword({
                email,
                resetCode,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });
            toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");

            sessionStorage.removeItem("pendingResetEmail");
            sessionStorage.removeItem("verifiedResetEmail");
            sessionStorage.removeItem("verifiedResetCode");

            navigate("/login");
        }catch(error){
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    if(!email || !resetCode){
        return (
            <AuthLayout
                title="Thiếu thông tin đổi mật khẩu"
                description="Vui lòng xác nhận mã trước khi đổi mật khẩu."
            >
                <Button asChild className="w-full">
                    <Link to="/forgot-password">Quay lại quên mật khẩu</Link>
                </Button>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Đổi mật khẩu"
            description="Nhập mật khẩu mới cho tài khoản của bạn."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormError message={error} />

                <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                        Mật khẩu mới
                    </label>

                    <input
                        id="newPassword" 
                        type="password" 
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.newPassword}
                        onChange={(e) => updateField("newPassword", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                        Nhập lại mật khẩu mới
                    </label>

                    <input
                        id="confirmPassword" 
                        type="password" 
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        required
                    />
                </div>

                <SpinnerButton
                    type="submit"
                    loading={loading}
                    loadingText="Đang đổi mật khẩu..."
                    className="w-full"
                >
                    Đổi mật khẩu
                </SpinnerButton>
            </form>
        </AuthLayout>
    )
}