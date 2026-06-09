import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import PageLoading from "@/components/common/PageLoading";

export default function ProtectedRoute(){
    const {loading, isAuthenticated} = useAuth();

    if(loading){
        return (
            <div className="min-h-screen flex items-center justify-center">
                <PageLoading variant="plain" text="Đang tải..."/>
            </div>
        )
    }

    if(!isAuthenticated) return <Navigate to="/login" replace />;

    return <Outlet />;
}