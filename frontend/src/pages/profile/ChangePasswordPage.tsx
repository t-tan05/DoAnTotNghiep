import FormError from "@/components/common/FormError";
import SpinnerButton from "@/components/common/SpinnerButton";
import { userService } from "@/services/user.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useState } from "react";


export default function ChangePasswordPage() {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateField(name: keyof typeof form, value: string) {
        setForm((prev) => ({
            ...prev,
            [name] : value,
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setMessage("");

        if(form.newPassword !== form.confirmPassword){
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);

        try{
            await userService.changePassword(form);

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setMessage("Đổi mật khẩu thành công.");
        }catch(error){
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    return (
        <section className="rounded-xl border bg-white p-5 md:p-6">
            <h2 className="text-xl font-bold md:text-2xl">Đổi mật khẩu</h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <FormError message={error} />

                {message && (
                    <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                        {message}
                    </div>
                )}

                <input 
                    type="password" 
                    placeholder="Mật khẩu hiện tại"
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.currentPassword}
                    onChange={(e) => updateField("currentPassword", e.target.value)}
                    required
                />

                <input 
                    type="password" 
                    placeholder="Mật khẩu mới"
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.newPassword}
                    onChange={(e) => updateField("newPassword", e.target.value)}
                    required
                />

                <input 
                    type="password" 
                    placeholder="Nhập lại mật khẩu mới"
                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    required
                />

                <SpinnerButton 
                    type="submit"
                    loading={loading}
                    loadingText="Đang đổi mật khẩu..."
                >
                    Đổi mật khẩu
                </SpinnerButton>
            </form>
        </section>
    )
}