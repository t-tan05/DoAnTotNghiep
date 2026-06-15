import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoading from "@/components/common/PageLoading";

export default function ProtectedRoute(){
    const {loading, isAuthenticated, user} = useAuth();
    const location = useLocation();

    if(loading){
        return (
            <div className="min-h-screen flex items-center justify-center">
                <PageLoading variant="plain" text="Đang tải..."/>
            </div>
        )
    }

    if(!isAuthenticated) return <Navigate to="/login" replace state={{from: location.pathname}}/>;

    if(user?.must_change_password && location.pathname !== "/account/password"){
        return <Navigate to="/account/password" replace />;
    }

    return <Outlet />;
}
