import { useAuth } from "@/hooks/useAuth";
import { isStaffUser } from "@/utils/authRole";
import { Navigate, Outlet } from "react-router-dom";

export default function CustomerRoute() {
    const { user } = useAuth();

    if(isStaffUser(user)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}
