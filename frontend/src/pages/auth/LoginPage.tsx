import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { getSafeRedirectPath } from "@/utils/authRedirect";
import { getErrorMessage } from "@/utils/getErrorMessage";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
    const {login} = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const redirectTo = getSafeRedirectPath((location.state as { from?: unknown } | null)?.from);

    function updateField(name: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
            await login(form.email, form.password, redirectTo);
            toast.success("Đăng nhập thành công.");
        }catch(error) {
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Đăng nhập" description="Đăng nhập vào tài khoản của bạn.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormError message={error}/>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <input 
                        type="email" 
                        id="email"
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
                    <input 
                        type="password" 
                        id="password"
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        required
                    />
                </div>

                <SpinnerButton 
                    type="submit"
                    loading={loading}
                    loadingText="Đang đăng nhập..."
                    className="w-full"
                >
                    Đăng nhập
                </SpinnerButton>

                <div className="flex justify-between text-sm">
                    <Link to="/forgot-password" className="text-primary hover:underline">
                        Quên mật khẩu?
                    </Link>

                    <Link to="/register" className="text-primary hover:underline">
                        Đăng ký
                    </Link>
                </div>
            </form>
        </AuthLayout>
    )
}
