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

type VerifyEmailLocationState = {
    email?: string;
};

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const location = useLocation();

    //Lấy email được truyền từ register
    const email = useMemo(() => {
        const state = location.state as VerifyEmailLocationState | null;

        return state?.email || sessionStorage.getItem("pendingVerifyEmail") || "";
    },[location.state] );

    const [verifyToken, setVerifyToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const isOtpComplete = verifyToken.length === 6;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if(!email){
            setError("Không tìm thấy email cần xác thực. Vui lòng đăng ký lại.");
            return;
        }

        if(!isOtpComplete){
            setError("Vui lòng nhập đủ 6 ký tự xác thực.");
            return;
        }

        setLoading(true);

        try{
            await authService.verifyEmail({email, verifyToken});
            toast.success("Xác thực email thành công. Bạn có thể đăng nhập.");

            sessionStorage.removeItem("pendingVerifyEmail");

            navigate("/login");
        }catch(error){
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    async function handleResend(){
        setError("");

        if(!email) {
            setError("Không tìm thấy email cần xác thực. Vui lòng đăng ký lại.");
            return;
        }

        setResending(true);

        try{
            const res = await authService.resendVerifyEmail(email);
            toast.success(res.data.message || "Đã gửi lại mã xác thực.");
            setVerifyToken("");
        }catch(error) {
            setError(getErrorMessage(error));
        }finally{
            setResending(false);
        }
    }

    if(!email){
        return (
            <AuthLayout
                title="Thiếu thông tin xác thực"
                description="Không tìm thấy email cần xác thực. Vui lòng quay lại đăng ký."
            >
                <Button asChild className="w-full">
                    <Link to="/register">Quay lại đăng ký</Link>
                </Button>

                <Button asChild variant="ghost" className="mt-3 w-full">
                    <Link to="/login">Đăng nhập</Link>
                </Button>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Xác thực email"
            description="Nhập mã xác thực gồm 6 ký tự đã được gửi tới email của bạn."
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <FormError message={error}/>

                <p className="text-center text-sm text-muted-foreground">
                    Mã xác thực đã được gửi tới{" "}
                    <span className="font-medium text-foreground">{email}</span>
                </p>

                <div className="space-y-3">
                    <label className="block text-center text-sm font-medium">
                        Mã xác thực
                    </label>

                    <OtpInputField
                        value={verifyToken}
                        onChange={setVerifyToken}
                        disable={loading || resending}
                    />
                </div>

                <SpinnerButton
                    type="submit"
                    loading={loading}
                    loadingText="Đang xác thực..."
                    disabled={!email || !isOtpComplete}
                    className="w-full"
                >
                    Xác thực
                </SpinnerButton>

                <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleResend}
                    disabled={resending || !email}
                >
                    {resending ? "Đang gửi lại..." : "Gửi lại mã"}
                </Button>
            </form>

        </AuthLayout>
    )
}