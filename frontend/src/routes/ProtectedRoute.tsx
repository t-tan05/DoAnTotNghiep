import SpinnerButton from "@/components/common/SpinnerButton";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute(){
    const {loading, isAuthenticated} = useAuth();

    if(loading){
        return (
            <div className="min-h-screen flex items-center justify-center">
                <SpinnerButton loading loadingText="Đang tải..." disabled/>
            </div>
        )
    }

    if(!isAuthenticated) return <Navigate to="/login" replace />;

    return <Outlet />;
}