import PageLoading from "@/components/common/PageLoading";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute(){
    const {loading, user, isAuthenticated} = useAuth();

    if(loading){
        return(
            <div className="min-h-screen flex items-center justify-center">
                <PageLoading variant="plain" text="Đang tải..." />
            </div>
        )
    }

    if(isAuthenticated){
        const isAdmin = user?.roles?.includes("ADMIN");

        if(isAdmin){
            return <Navigate to="/admin" replace/>;
        }

        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}