import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateField(name: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [name]:value,
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
            await authService.register(form);

            sessionStorage.setItem("pendingVerifyEmail", form.email);

            navigate("/verify-email", {
                state: {
                    email: form.email,
                },
            });
        }catch(error) {
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Đăng ký" description="Tạo tài khoản mới.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormError message={error} />

                <input 
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm" 
                    placeholder="Họ tên" 
                    value={form.name} 
                    onChange={(e) => updateField("name", e.target.value)} 
                    required 
                />
                <input 
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm" 
                    placeholder="Email" 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => updateField("email", e.target.value)} 
                    required 
                />
                <input 
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm" 
                    placeholder="Mật khẩu" 
                    type="password" 
                    value={form.password} 
                    onChange={(e) => updateField("password", e.target.value)} 
                    required 
                />
                <input 
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm" 
                    placeholder="Nhập lại mật khẩu" 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={(e) => updateField("confirmPassword", e.target.value)} 
                    required 
                />

                <SpinnerButton 
                    type="submit"
                    loading={loading}
                    loadingText="Đang đăng ký..."
                    className="w-full"
                >
                    Đăng ký
                </SpinnerButton>

                <p className="text-center text-sm">
                    Đã có tài khoản?{" "}
                    <Link 
                        to="/login" 
                        className="text-primary hover:underline"
                    >
                        Đăng nhập
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}