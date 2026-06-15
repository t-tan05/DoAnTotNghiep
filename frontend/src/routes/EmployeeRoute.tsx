import PageLoading from "@/components/common/PageLoading";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function EmployeeRoute() {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <PageLoading variant="plain" text="Đang tải..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.must_change_password) {
        return <Navigate to="/account/password" replace />;
    }

    const isAdmin = user?.roles?.includes("ADMIN");
    const isEmployee = user?.roles?.includes("EMPLOYEE");

    if (isAdmin && !isEmployee) {
        return <Navigate to="/admin" replace />;
    }

    if (!isEmployee) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}
