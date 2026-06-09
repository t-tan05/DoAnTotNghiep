import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/user.service";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import FormError from "../common/FormError";
import SpinnerButton from "../common/SpinnerButton";

export default function AccountInfoForm() {
    const {user, reloadUser} = useAuth();

    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName(user?.name || "");
    }, [user]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try{
            await userService.updateProfile({name});
            await reloadUser();

            setMessage("Cập nhật thông tin thành công.");
        }catch(error){
            setError(getErrorMessage(error));
        }finally{
            setLoading(false);
        }
    }

    return (
        <section className="rounded-xl border bg-white p-5 md:p-6">
            <h2 className="text-xl font-bold md:text-2xl">Thông tin tài khoản</h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <FormError message={error} />
                
                {message && (
                    <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                        {message}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium">Họ tên</label>

                    <input 
                        className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <SpinnerButton
                    type="submit"
                    loading={loading}
                    loadingText="Đang cập nhật..."
                    className="hover:cursor-pointer"
                >
                    Cập nhật
                </SpinnerButton>
            </form>
        </section>
    );
}