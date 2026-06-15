import PageLoading from "@/components/common/PageLoading";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
    const { loading, user, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <PageLoading variant="plain" text="Đang tải..." />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (user?.must_change_password) {
        return <Navigate to="/account/password" replace />;
    }

    const isAdmin = user?.roles?.includes("ADMIN");
    const isEmployee = user?.roles?.includes("EMPLOYEE");

    if (!isAdmin && isEmployee) {
        return <Navigate to="/employee" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}
