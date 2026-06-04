import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authService.forgotPassword({email});

            sessionStorage.setItem("pendingResetEmail", email);

            navigate("/verify-reset-code", {
                state: {
                    email,
                },
            });
        }catch(error) {
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Quên mật khẩu"
            description="Nhập email để nhận mã xác nhận đổi mật khẩu"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormError message={error} />

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                        Email
                    </label>

                    <input 
                        id="email"
                        type="email"
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <SpinnerButton 
                    type="submit"
                    loading={loading}
                    loadingText="Đang gửi mã..."
                    className="w-full"
                >
                    Gửi mã xác nhận
                </SpinnerButton>
            </form>
        </AuthLayout>
    )
}