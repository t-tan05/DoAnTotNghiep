import PageLoading from "@/components/common/PageLoading";
import { useAuth } from "@/hooks/useAuth";
import { getSafeRedirectPath } from "@/utils/authRedirect";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function GuestRoute() {
    const { loading, user, isAuthenticated } = useAuth();
    const location = useLocation();
    const redirectTo = getSafeRedirectPath((location.state as { from?: unknown } | null)?.from);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <PageLoading variant="plain" text="Đang tải..." />
            </div>
        );
    }

    if (isAuthenticated) {
        if (user?.must_change_password) {
            return <Navigate to="/account/password" replace />;
        }

        if (user?.roles?.includes("ADMIN")) {
            return <Navigate to="/admin" replace />;
        }

        if (user?.roles?.includes("EMPLOYEE")) {
            return <Navigate to="/employee" replace />;
        }

        return <Navigate to={redirectTo || "/"} replace />;
    }

    return <Outlet />;
}
